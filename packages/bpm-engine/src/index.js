import 'source-map-support/register';

import defaults from 'lib/defaults';
import loadPlugins from 'lib/loadPlugins';
import debug from 'lib/debug';
import TokenInstance from 'lib/TokenInstance';
import Clock from 'lib/Clock';
import makeInterval from 'iso8601-repeating-interval';

import * as constants from 'lib/constants';

const getNextFlowObjects = (flowObjects, nextId) => {
  let result;
  if (flowObjects.find(el => el.id === nextId)) {
    result = flowObjects;
  }
  else {
    flowObjects.forEach((el) => {
      if (el.flowElements && !result) {
        result = getNextFlowObjects(el.flowElements, nextId);
      }
    });
  }

  return result;
};

const log = debug('engine');

/**
 *
 */
class BPMEngine {
  constructor({
    generateId = defaults.generateId,
    evalCondition = defaults.evalCondition,
    persist = new defaults.MemoryPersist(),
    enableClock = true,
    plugins = [],
  } = {}) {
    Object.assign(this, {
      generateId,
      evalCondition,
      persist,
      plugins: loadPlugins(plugins),
    });

    if (enableClock) {
      this.clock = new Clock({ onTick: this.onTick, interval: 500 });
    }

    log('Initiated');
  }

  onTick = async () => {
    log('tick');
    const currentTimestamp = new Date() / 1;
    const timerEvent = await this.persist.timers.getNext(currentTimestamp);

    if (timerEvent) {
      // set this timer to done, so it won't be returned by above `getNext` again
      await this.handleTimerEvent(timerEvent);
      await this.persist.timers.update({ timerId: timerEvent.timerId }, { status: 'done' });

      // get the next one after the current one
      const interval = makeInterval(timerEvent.interval);
      const nextTimerEvent = interval.firstAfter(timerEvent.time + 1);

      // if there is no next, complete this tick
      if (!nextTimerEvent) {
        return;
      }

      // if the next timerEvent index is lower than the repetitions defined in the interval
      // create the next run in the database (key-concept for timers, schedule next one after current one)
      if (nextTimerEvent.index < interval._repeatCount) {
        await this.persist.timers.create({
          timerId: this.generateId(),
          index: nextTimerEvent.index,
          interval: timerEvent.interval,
          time: nextTimerEvent.date / 1,
          previousTimerId: timerEvent.timerId,
          intent: timerEvent.intent,
          workflowDefinitionId: timerEvent.workflowDefinitionId,
        });
      }
    }
  };

  async handleTimerEvent(timerEvent) {
    let token;
    const { intent } = timerEvent;

    // if the intention of the timer is to start a process instance
    // create a new process instance and get its token
    if (intent === constants.START_PROCESS_INSTANCE_INTENT) {
      const { workflowDefinitionId } = timerEvent;
      token = await this.createProcessInstance({ workflowDefinitionId });
    }

    // if the intention of the timer is to continue a token instance
    // get the token instance
    if (intent === constants.CONTINUE_TOKEN_INSTANCE_INTENT) {
      const { tokenId } = timerEvent;
      token = await this.continueTokenInstance({ tokenId });
    }

    // if a token was created/fetched, continue its execution
    if (token) {
      await token.execute();
    }
  }

  async createProcessInstance({ workflowDefinition, workflowDefinitionId, payload = {} } = {}) {
    let workflowDefinitionXML;

    if (workflowDefinition) {
      workflowDefinitionXML = workflowDefinition;
    }
    else if (workflowDefinitionId) {
      const deployedWorkflowDefinition = await this.findWorkflowDefinition(workflowDefinitionId);
      if (deployedWorkflowDefinition) {
        workflowDefinitionXML = deployedWorkflowDefinition.xml;
      }
    }

    if (!workflowDefinitionXML) {
      throw new Error('Invalid WorkflowDefinition');
    }

    const processId = this.generateId();
    log(`Creating processInstance ${processId}`);
    await this.persist.processInstance.create({
      processId,
      workflowDefinition: workflowDefinitionXML,
      payload,
    });
    log(`processInstance ${processId} created`);

    const tokenInstance = await this.createTokenInstance({
      processId,
      payload,
      workflowDefinition: workflowDefinitionXML,
    });

    return tokenInstance;
  }

  async createTokenInstance({
    processId,
    payload,
    workflowDefinition,
    tokenId = this.generateId(),
    status,
    parent,
    isSubProcess,
    currentActivity,
    flowObjects,
  }) {
    log(`Creating tokenInstance ${tokenId}`);
    const tokenInstance = new TokenInstance({
      processId,
      tokenId,
      payload,
      workflowDefinition,
      status,
      parent,
      isSubProcess,
      currentActivity,
      engine: this,
    });
    if (!flowObjects) {
      await tokenInstance.initialize();
    }
    else {
      tokenInstance.flowObjects = flowObjects;
    }
    log(`tokenInstance ${tokenId} created`);

    return tokenInstance;
  }

  async continueTokenInstance({ tokenId, payload = {} }) {
    log(`Continuing tokenInstance ${tokenId}`);
    const persistedTokenInstance = await this.findTokenInstance(tokenId);
    const persistedProcessInstance = await this.findProcessInstance(persistedTokenInstance.processId);

    const { workflowDefinition } = persistedProcessInstance;
    const mergedPayload = Object.assign(
      persistedProcessInstance.payload,
      persistedTokenInstance.payload,
      payload,
    );

    const tokenInstance = await this.createTokenInstance({
      processId: persistedProcessInstance.processId,
      payload: mergedPayload,
      workflowDefinition,
      tokenId,
      status: 'paused',
      currentActivity: persistedTokenInstance.next,
      isSubProcess: persistedTokenInstance.isSubProcess,
      parent: persistedTokenInstance.parent,
    });

    tokenInstance.flowObjects = getNextFlowObjects(
      tokenInstance.flowObjects,
      persistedTokenInstance.currentActivity,
    );

    tokenInstance.next = tokenInstance.flowObjects.find(el => el.id === persistedTokenInstance.currentActivity);

    return tokenInstance;
  }

  findTokenInstance(tokenId) {
    return this.persist.tokenInstance.find({ tokenId });
  }

  findProcessInstance(processId) {
    return this.persist.processInstance.find({ processId });
  }

  findWorkflowDefinition(workflowDefinitionId) {
    return this.persist.workflowDefinition.find({ workflowDefinitionId });
  }

  // create listeners for timer and message start events
  async createStartEvents(xml, workflowDefinitionId) {
    // create a TokenInstance to parse the flowObjects
    const tokenInstance = new TokenInstance({
      workflowDefinition: xml,
    });

    await tokenInstance.initialize();

    const { flowObjects } = tokenInstance;

    flowObjects.forEach(async (flowObject) => {
      if (flowObject.$type === 'bpmn:StartEvent') {
        const { eventDefinitions } = flowObject;
        if (eventDefinitions) {
          const firstEventDefinition = eventDefinitions[0];
          if (firstEventDefinition.$type === 'bpmn:TimerEventDefinition') {
            if (firstEventDefinition.timeCycle) {
              const fnBody = `return \`${firstEventDefinition.timeCycle.body}\`;`;
              const f = new Function('timestamp', fnBody);
              const intervalString = f(new Date().toISOString());

              const interval = makeInterval(intervalString);
              const firstAfter = interval.firstAfter(new Date() / 1 - 1000);

              if (firstAfter.index < interval._repeatCount) {
                await this.persist.timers.create({
                  timerId: this.generateId(),
                  index: firstAfter.index,
                  time: firstAfter.date / 1,
                  interval: intervalString,
                  intent: constants.START_PROCESS_INSTANCE_INTENT,
                  workflowDefinitionId,
                });
              }
            }
          }
        }
      }
    });
  }

  async deployWorkflowDefinition({ xml, workflowDefinitionId = this.generateId() }) {
    // create start events
    await this.createStartEvents(xml, workflowDefinitionId);

    return this.persist.workflowDefinition.create({
      xml,
      workflowDefinitionId,
    });
  }
}

export default BPMEngine;
export { default as Plugins } from 'lib/Plugins';

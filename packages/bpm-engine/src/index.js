import 'source-map-support/register';

import defaults from 'lib/defaults';
import loadPlugins from 'lib/loadPlugins';
import debug from 'lib/debug';
import TokenInstance from 'lib/TokenInstance';

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
    plugins = [],
  } = {}) {
    Object.assign(this, {
      generateId,
      evalCondition,
      persist,
      plugins: loadPlugins(plugins),
    });

    log('Initiated');
  }

  async createProcessInstance({
    workflowDefinition,
    workflowDefinitionId,
    payload = {},
    meta,
  } = {}) {
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
      meta,
    });

    return tokenInstance;
  }

  async createTokenInstance({
    processId,
    payload,
    workflowDefinition,
    meta,
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
      meta,
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

  async continueTokenInstance({ tokenId, payload, meta }) {
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
      meta,
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

  deployWorkflowDefinition({ xml, workflowDefinitionId = this.generateId() }) {
    return this.persist.workflowDefinition.create({
      xml,
      workflowDefinitionId,
    });
  }
}

export default BPMEngine;
export { default as Plugins } from 'lib/Plugins';

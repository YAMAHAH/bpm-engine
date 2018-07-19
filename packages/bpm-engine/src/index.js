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
    slowMotion = false,
  } = {}) {
    Object.assign(this, {
      generateId,
      evalCondition,
      persist,
      slowMotion: slowMotion && (typeof slowMotion === 'number' ? slowMotion : 500),
      plugins: loadPlugins(plugins),
    });

    log('Initiated');
  }

  async createProcessInstance({ workflowDefinition, payload = {}, meta } = {}) {
    if (!workflowDefinition) {
      throw new Error('Parameter "workflowDefinition" is required');
    }

    const processId = this.generateId();
    log(`Creating processInstance ${processId}`);
    await this.persist.processInstance.create({
      processId,
      workflowDefinition,
      payload,
    });
    log(`Created processInstance ${processId}`);

    const tokenInstance = await this.createTokenInstance({
      processId,
      payload,
      workflowDefinition,
      meta,
    });

    return tokenInstance;
  }

  async createTokenInstance({
    processId,
    payload,
    workflowDefinition,
    meta,
    tokenId,
    status,
    parent,
    isSubProcess,
    currentActivity,
    flowObjects,
  }) {
    const tid = tokenId || this.generateId();

    log(`Creating tokenInstance ${tid}`);
    const tokenInstance = new TokenInstance({
      processId,
      tokenId: tid,
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
    log(`Created tokenInstance ${tid}`);

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
}

export default BPMEngine;
export { default as Plugins } from 'lib/Plugins';

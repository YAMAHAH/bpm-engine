// TODO(lg): investigate why exactly and when this needs to be imported.
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
class JSPE {
  constructor({
    generateId = defaults.generateId,
    evalCondition = defaults.evalCondition,
    persist = defaults.persist,
    plugins = [],
    slowMotion = false,
    store = defaults.persist.createStore(),
  } = {}) {
    Object.assign(this, {
      generateId,
      evalCondition,
      persist,
      store,
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
    log(`Creating PI ${processId}`);
    await this.persist.processInstance.create(
      {
        processId,
        workflowDefinition,
        payload,
      },
      this.store.processInstances,
    );
    log(`Created PI ${processId}`);

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

    log(`Creating TI ${tid}`);
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
    log(`Created TI ${tid}`);

    return tokenInstance;
  }

  async continueTokenInstance({ tokenId, payload, meta }) {
    log(`Continuing TI ${tokenId}`);
    const persistedTI = await this.findTokenInstance(tokenId);
    const persistedPI = await this.findProcessInstance(persistedTI.processId);

    const { workflowDefinition } = persistedPI;
    const mergedPayload = Object.assign(persistedPI.payload, persistedTI.payload, payload);

    const ti = await this.createTokenInstance({
      processId: persistedPI.processId,
      payload: mergedPayload,
      workflowDefinition,
      meta,
      tokenId,
      status: 'paused',
      currentActivity: persistedTI.next,
      isSubProcess: persistedTI.isSubProcess,
      parent: persistedTI.parent,
    });

    ti.flowObjects = getNextFlowObjects(ti.flowObjects, persistedTI.currentActivity);
    ti.next = ti.flowObjects.find(el => el.id === persistedTI.currentActivity);

    return ti;
  }

  findTokenInstance(tokenId) {
    return this.persist.tokenInstance.find({ tokenId }, this.store.tokenInstances);
  }

  findProcessInstance(processId) {
    return this.persist.processInstance.find({ processId }, this.store.processInstances);
  }
}

export default JSPE;
export { default as Plugins } from 'lib/Plugins';

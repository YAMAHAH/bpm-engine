import debug from 'lib/debug';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const log = debug('process');

export default class Element {
  constructor({ definition, plugins, tokenInstance }) {
    this.definition = definition;
    this.plugins = plugins;
    this.tokenInstance = tokenInstance;
    this.engine = tokenInstance.engine;
    this.evalCondition = this.engine.evalCondition;
    this.persist = this.engine.persist;
  }

  triggerState = async (state) => {
    if (this.engine.slowMotion) {
      await sleep(this.engine.slowMotion);
    }

    log(`${this.tokenInstance.tokenId} > ${this.definition.id} > ${state}`);

    if (state === 'ready') {
      return this.runOnAllPlugins('onReady');
    }
    else if (state === 'active') {
      return this.runOnAllPlugins('onActive');
    }
    else if (state === 'complete') {
      return this.runOnAllPlugins('onComplete');
    }
  };

  runOnAllPlugins = (fn) => {
    const promises = [];
    Object.keys(this.plugins).forEach((pluginName) => {
      if (this.plugins[pluginName][fn]) {
        const plugin = this.plugins[pluginName][fn];
        promises.push(plugin(this.definition, this.tokenInstance));
      }
    });
    return Promise.all(promises);
  };

  makeReady() {
    return this.triggerState('ready');
  }

  makeActive() {
    return this.triggerState('active');
  }

  makeComplete() {
    return this.triggerState('complete');
  }

  persistChildIdsToParent(childIds) {
    return this.persist.tokenInstance.update(
      { tokenId: this.tokenInstance.tokenId },
      {
        $set: {
          currentActivity: this.definition.id,
          childs: childIds,
        },
      },
    );
  }

  setupChilds(outgoing) {
    return Promise.all(outgoing.map(async (path) => {
      const token = await this.engine.createTokenInstance({
        workflowDefinition: this.tokenInstance.workflowDefinition,
        payload: this.tokenInstance.payload,
        meta: this.tokenInstance.meta,
        processId: this.tokenInstance.processId,
        parent: this.tokenInstance.tokenId,
        isSubProcess: this.tokenInstance.isSubProcess,
        currentActivity: path.id,
        status: 'running',
        flowObjects: this.tokenInstance.flowObjects,
      });

      token.next = token.flowObjects.find(el => el.id === path.id);

      return token;
    }));
  }
}

import Activity from 'lib/Elements/Activity';
import serial from 'lib/serial';

export default class SubProcess extends Activity {
  async getSubProcessItems(loop) {
    const { evalCondition, tokenInstance } = this;
    const { payload } = tokenInstance;

    const collectionLocation = loop.$attrs['camunda:collection'];
    const cardinality = loop.loopCardinality && Number(loop.loopCardinality.body);

    let collection = [];

    if (collectionLocation) {
      collection = await evalCondition(collectionLocation, payload);
    }

    if (cardinality) {
      for (let i = 0; i < cardinality; i += 1) {
        collection.push(i);
      }
    }

    return collection;
  }

  makeActive = async () => {
    await this.callPlugins('onActive');
    this.tokenInstance.status = 'paused';

    const loop = this.definition.loopCharacteristics;

    let childTokenInstances = [];

    // not looping, not a multi instance
    if (!loop) {
      const tokenInstance = await this.engine.createTokenInstance({
        payload: this.tokenInstance.payload,
        parent: this.tokenInstance.tokenId,
        processId: this.tokenInstance.processId,
        flowObjects: this.definition.flowElements,
      });

      childTokenInstances.push(tokenInstance);
    }
    else {
      // get cardinality or collection
      const subProcessItems = await this.getSubProcessItems(loop);

      if (!subProcessItems || subProcessItems.length === 0) {
        this.tokenInstance.status = 'running';
      }
      else {
        childTokenInstances = await Promise.all(subProcessItems.map(async (item) => {
          const payload = JSON.parse(JSON.stringify(this.tokenInstance.payload));

          if (!payload._) {
            payload._ = {};
          }

          payload._.item = item;

          const tokenInstance = await this.engine.createTokenInstance({
            payload,
            parent: this.tokenInstance.tokenId,
            processId: this.tokenInstance.processId,
            isSubProcess: true,
            flowObjects: this.definition.flowElements,
          });

          return tokenInstance;
        }));
      }
    }

    const childTokenInstancesIds = childTokenInstances.map(child => child.tokenId);
    await this.persistChildIdsToParent(childTokenInstancesIds);

    childTokenInstances.forEach(async (childTokenInstance) => {
      await childTokenInstance.persistCreate();
    });

    const funcs = childTokenInstances.map(childTokenInstance => childTokenInstance.execute);
    await serial(funcs);
  };
}

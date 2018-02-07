import Activity from 'lib/Elements/Activity';
import serial from 'lib/serial';

const getSubProcessItems = async (loop, evalCondition, payload) => {
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
};

export default class SubProcess extends Activity {
  makeActive = async () => {
    await this.triggerState('active');
    this.tokenInstance.status = 'paused';

    const loop = this.definition.loopCharacteristics;

    let childs = [];

    // not looping, not a multi instance
    if (!loop) {
      const ti = await this.engine.createTokenInstance({
        definition: this.tokenInstance.workflowDefinition,
        payload: this.tokenInstance.payload,
        parent: this.tokenInstance.tokenId,
        processId: this.tokenInstance.processId,
        meta: this.tokenInstance.meta,
        flowObjects: this.definition.flowElements,
      });

      childs.push(ti);
    }
    else {
      // get cardinality or collection
      const subProcessItems = await getSubProcessItems(
        loop,
        this.evalCondition,
        this.tokenInstance.payload,
      );

      if (!subProcessItems || subProcessItems.length === 0) {
        this.tokenInstance.status = 'running';
      }
      else {
        childs = await Promise.all(subProcessItems.map(async (item) => {
          const payload = JSON.parse(JSON.stringify(this.tokenInstance.payload));

          if (!payload._) {
            payload._ = {};
          }

          payload._.item = item;

          const ti = await this.engine.createTokenInstance({
            workflowDefinition: this.tokenInstance.workflowDefinition,
            payload,
            parent: this.tokenInstance.tokenId,
            processId: this.tokenInstance.processId,
            meta: this.tokenInstance.meta,
            isSubProcess: true,
            flowObjects: this.definition.flowElements,
          });

          return ti;
        }));
      }
    }

    const childIds = childs.map(child => child.tokenId);

    await this.persistChildIdsToParent(childIds);

    const funcs = childs.map(child => () => child.exec());

    return serial(funcs);
  };
}

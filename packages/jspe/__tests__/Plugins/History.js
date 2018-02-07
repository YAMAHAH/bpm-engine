import JSPE from '../../index';

export default class History extends JSPE.Plugins.Element {
  constructor({ store = [] } = {}) {
    super();
    this.store = store;
  }

  onReady = (definition) => {
    this.store.push({
      state: 'ready',
      elementId: definition.id,
      participant: definition.participant,
      lanes: definition.lanes,
    });
  };
  onActive = (definition) => {
    this.store.push({
      state: 'active',
      elementId: definition.id,
      participant: definition.participant,
      lanes: definition.lanes,
    });
  };
  onComplete = (definition) => {
    this.store.push({
      state: 'complete',
      elementId: definition.id,
      participant: definition.participant,
      lanes: definition.lanes,
    });
  };
}

import Event from 'lib/Elements/Event';

export default class StartEvent extends Event {
  makeReady = async () => {
    this.tokenInstance.status = 'running';

    await this.triggerState('ready');

    await this.persist.tokenInstance.create(
      this.tokenInstance.toJSON(),
      this.engine.store.tokenInstances,
    );
  };
}

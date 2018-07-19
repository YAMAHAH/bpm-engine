import Event from 'lib/Elements/Event';

export default class StartEvent extends Event {
  makeReady = async () => {
    this.tokenInstance.status = 'running';

    await this.callPlugins('onReady');

    await this.persist.tokenInstance.create(this.tokenInstance.toJSON());
  };
}

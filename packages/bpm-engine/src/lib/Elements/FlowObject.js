import Element from 'lib/Element';

export default class FlowObject extends Element {
  makeActive = () => {
    if (this.tokenInstance.status === 'running') {
      return this.callPlugins('onActive');
    }

    return Promise.resolve();
  };
}

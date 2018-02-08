import BPMEngine from '../../index';

export default class ExternalServices extends BPMEngine.Plugins.ServiceTask {
  onActive = (activity, tokenInstance) => {
    console.log(`this is running onActive on a ServiceTask for activity: ${
      activity.id
    } in processInstance with id: ${tokenInstance.processId}`);
  };
}

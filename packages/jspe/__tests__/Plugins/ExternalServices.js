import JSPE from '../../index';

export default class ExternalServices extends JSPE.Plugins.ServiceTask {
  onActive = (activity, tokenInstance) => {
    console.log(`this is running onActive on a ServiceTask for activity: ${
      activity.id
    } in processInstance with id: ${tokenInstance.processId}`);
  };
}

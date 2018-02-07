import JSPE from '../../index';

export default class TaskManager extends JSPE.Plugins.UserTask {
  onActive = (activity, tokenInstance) => {
    console.log(`create a user task for activity with id: ${activity.id} in processInstance with id: ${
      tokenInstance.processId
    }`);
  };
}

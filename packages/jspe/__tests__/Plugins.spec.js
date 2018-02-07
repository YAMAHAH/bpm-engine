import jspe from 'jspe';

import TaskManager from './Plugins/TaskManager';
import ExternalServices from './Plugins/ExternalServices';

describe('Plugins', () => {
  it('Can setup a UserTask Plugin', async () => {
    const taskManager = new TaskManager();
    const jspe = new JSPE({
      plugins: [taskManager],
    });
    expect(jspe.plugins.userTask).toMatchSnapshot();
  });

  it('Can setup a ServiceTask Plugin', async () => {
    const externalServices = new ExternalServices();
    const jspe = new JSPE({
      plugins: [externalServices],
    });
    expect(jspe.plugins.serviceTask).toMatchSnapshot();
  });
});

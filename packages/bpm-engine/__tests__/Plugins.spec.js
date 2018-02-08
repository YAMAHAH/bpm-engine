import BPMEngine from 'bpm-engine';

import TaskManager from './Plugins/TaskManager';
import ExternalServices from './Plugins/ExternalServices';

describe('Plugins', () => {
  it('Can setup a UserTask Plugin', async () => {
    const taskManager = new TaskManager();
    const bpm = new BPMEngine({
      plugins: [taskManager],
    });
    expect(bpm.plugins.userTask).toMatchSnapshot();
  });

  it('Can setup a ServiceTask Plugin', async () => {
    const externalServices = new ExternalServices();
    const bpm = new BPMEngine({
      plugins: [externalServices],
    });
    expect(bpm.plugins.serviceTask).toMatchSnapshot();
  });
});

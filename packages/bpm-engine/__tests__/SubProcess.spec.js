import fs from 'fs';

import BPMEngine from 'bpm-engine';
import History from './Plugins/History';

describe('SubProcess', () => {
  it('Can run multiple subProcesses in parallel', async () => {
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    // start the process and the flow
    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/SubProcess.bpmn`, 'utf-8'),
    });

    await token.execute();

    // we only check if the desired end goal was reached, since
    // the flow sometimes takes differing paths
    expect(history.store[history.store.length - 1].elementId).toMatchSnapshot();
  });
});

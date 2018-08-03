import fs from 'fs';

import BPMEngine from 'bpm-engine';

import History from './Plugins/History';
import sleep from './Plugins/sleep';

describe('SwimLane', () => {
  it('Pauses a token and controls continuing it', async () => {
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    // start the process and the flow
    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/SwimLane.bpmn`, 'utf-8'),
    });
    await token.execute();

    await sleep(100);
    expect(history.store).toMatchSnapshot();
  });
});

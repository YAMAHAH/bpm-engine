import fs from 'fs';

import BPMEngine from 'bpm-engine';

import History from './Plugins/History';
import sleep from './Plugins/sleep';

describe('ParallelGateway', () => {
  it('Continues on all paths', async () => {
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/ParallelGateway.bpmn`, 'utf-8'),
    });

    await token.execute();
    await sleep(200);
    expect(history.store).toMatchSnapshot();
  });

  it('Runs services in parallel', async () => {
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/ParallelServices.bpmn`, 'utf-8'),
    });

    await token.execute();

    await sleep(200);
    expect(history.store).toMatchSnapshot();
  });
});

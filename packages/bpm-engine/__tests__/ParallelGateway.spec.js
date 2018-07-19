import fs from 'fs';

import BPMEngine from 'bpm-engine';
import History from './Plugins/History';

describe('ParallelGateway', () => {
  it('Continues on all paths', async (done) => {
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/ParallelGateway.bpmn`, 'utf-8'),
    });

    await token.execute();
    setTimeout(() => {
      expect(history.store).toMatchSnapshot();
      done();
    }, 100);
  });

  it('Runs services in parallel', async (done) => {
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/ParallelServices.bpmn`, 'utf-8'),
    });

    await token.execute();
    setTimeout(() => {
      expect(history.store).toMatchSnapshot();
      done();
    }, 100);
  });
});

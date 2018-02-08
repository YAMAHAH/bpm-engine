import fs from 'fs';

import BPMEngine from 'bpm-engine';
import History from './Plugins/History';

describe('InclusiveGateway', () => {
  it('Continues on all paths', async (done) => {
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/InclusiveGateway.bpmn`, 'utf-8'),
      payload: {
        top: true,
        bottom: true,
      },
    });

    await token.exec();
    setTimeout(() => {
      expect(history.store).toMatchSnapshot();
      done();
    }, 100);
  });

  it('Continues on one path', async (done) => {
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/InclusiveGateway.bpmn`, 'utf-8'),
      payload: {
        top: true,
      },
    });

    await token.exec();
    setTimeout(() => {
      expect(history.store).toMatchSnapshot();
      done();
    }, 100);
  });
});

import fs from 'fs';

import BPMEngine from 'bpm-engine';

import History from './Plugins/History';
import sleep from './Plugins/sleep';

describe('InclusiveGateway', () => {
  it('Continues on all paths', async () => {
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

    await token.execute();
    await sleep(100);
    expect(history.store).toMatchSnapshot();
  });

  it('Continues on one path', async () => {
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

    await token.execute();
    await sleep(100);
    expect(history.store).toMatchSnapshot();
  });

  it('Continues on default path', async () => {
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/InclusiveGateway.bpmn`, 'utf-8'),
      payload: {},
    });

    await token.execute();
    await sleep(100);
    expect(history.store).toMatchSnapshot();
  });

  it('Does not continue if there is no default path and no path expression matched', async () => {
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(
        `${__dirname}/diagrams/InclusiveGatewayWithoutDefaultSequenceFlow.bpmn`,
        'utf-8',
      ),
      payload: {},
    });

    await token.execute();
    await sleep(100);
    expect(history.store).toMatchSnapshot();
  });
});

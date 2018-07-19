import fs from 'fs';

import BPMEngine from 'bpm-engine';

describe('BPMEngine', () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = () => {};
  });

  afterEach(() => {
    console.error = consoleError;
  });

  it('BPMEngine uses a default slowMotion time, when active', () => {
    const bpm = new BPMEngine({ slowMotion: true });
    expect(bpm).toMatchSnapshot();
  });

  it('User can define a custom slowMotion time', async () => {
    const bpm = new BPMEngine({ slowMotion: 100 });
    expect(bpm).toMatchSnapshot();

    const token = await BPMEngine.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/UserTask.bpmn`, 'utf-8'),
    });

    await token.execute();
  });

  it('User can define his own store for volatile persistance', () => {
    const bpm = new BPMEngine({ store: [] });
    expect(bpm).toMatchSnapshot();
  });

  it('User can define his own persistance methods', () => {
    const bpm = new BPMEngine({ persist: {} });
    expect(bpm).toMatchSnapshot();
  });

  it('User can define his own method for validation of conditions', () => {
    const bpm = new BPMEngine({ evalCondition: () => {} });
    expect(bpm).toMatchSnapshot();
  });

  it('User can define his own method for generation of resource ids', () => {
    const bpm = new BPMEngine({ generateId: () => {} });
    expect(bpm).toMatchSnapshot();
  });

  it('Can not instantiate a new processInstance without a workflowDefinition', async () => {
    const bpm = new BPMEngine({ slowMotion: true });
    await expect(bpm.createProcessInstance()).rejects.toMatchSnapshot();
  });

  it('Can not instantiate a new processInstance without a "valid" workflowDefinition', async () => {
    const bpm = new BPMEngine({ slowMotion: true });
    await expect(bpm.createProcessInstance({ workflowDefinition: 'INVALID_XML' })).rejects.toMatchSnapshot();
  });
});

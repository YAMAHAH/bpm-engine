import fs from 'fs';

import BPMEngine from 'bpm-engine';

import History from './Plugins/History';

describe('ScriptTask', () => {
  it('should run a script task successfullt', async () => {
    // given
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/ScriptTask.bpmn`, 'utf-8'),
    });

    // when
    await token.execute();

    // // then
    expect(token.payload).toMatchSnapshot();
    expect(token.status).toBe('ended');
  });

  it('should break when using a unsupported script format', async () => {
    // given
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(
        `${__dirname}/diagrams/ScriptTaskWithUnsupportedScriptFormat.bpmn`,
        'utf-8',
      ),
    });

    // when
    await expect(token.execute()).rejects.toMatchSnapshot();

    // // then
    expect(token.status).toBe('paused');
  });
});

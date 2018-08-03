import fs from 'fs';

import BPMEngine from 'bpm-engine';

import History from './Plugins/History';
import sleep from './Plugins/sleep';

describe('TimerCatchEvent', () => {
  it('Process execution waits as expected', async () => {
    const history = new History();
    const engine = new BPMEngine({
      plugins: [history],
    });

    const token = await engine.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/TimerCatchEvent.bpmn`, 'utf-8'),
    });

    await token.execute();

    // after 1 second, the process should still not be ended,
    // since its supposed to be waiting for execution at the timer catch event
    expect(engine.persist.store.processInstances[0].status).not.toBe('ended');

    await sleep(1000);

    expect(engine.persist.store.processInstances[0].status).toBe('ended');
  });
});

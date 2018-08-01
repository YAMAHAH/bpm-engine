import fs from 'fs';

import BPMEngine from 'bpm-engine';
import History from './Plugins/History';

describe('TimerStartEvent', () => {
  it('Can start a process with a timer', async (done) => {
    const history = new History();
    const engine = new BPMEngine({
      plugins: [history],
    });

    await engine.deployWorkflowDefinition({
      xml: fs.readFileSync(`${__dirname}/diagrams/TimerStartEvent.bpmn`, 'utf-8'),
    });

    setTimeout(() => {
      // we expect 3 process instances to have been started while waiting for 4 seconds
      // because the timerStart event interval is: R3/${timestamp}/PT1S which equals to
      // repeat 3 times, starting on timestamp of deployment, every 1 second
      expect(engine.persist.store.processInstances.length).toBe(3);
      done();
    }, 4000);
  });
});

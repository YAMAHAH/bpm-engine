import fs from 'fs';

import BPMEngine from 'bpm-engine';
import History from './Plugins/History';

describe('MessageStart', () => {
  it('Can start a process with a message', async (done) => {
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });
    done();
  });
});

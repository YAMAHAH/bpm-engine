import fs from 'fs';

import BPMEngine from 'bpm-engine';
import History from './Plugins/History';

describe('MessageStart', () => {
  it('Can start a process with a message', async (done) => {
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    // // start the process and the flow
    // const token = await bpm.createProcessInstance({
    //   workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/MessageStart.bpmn`, 'utf-8'),
    // });
    // await token.execute();

    // setTimeout(() => {
    //   expect(history.store).toMatchSnapshot();
    //   done();
    // }, 100);
  });
});

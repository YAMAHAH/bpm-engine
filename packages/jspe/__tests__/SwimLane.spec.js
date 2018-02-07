import fs from 'fs';

import JSPE from 'jspe';
import History from './Plugins/History';

describe('SwimLane', () => {
  it('Pauses a token and controls continuing it', async (done) => {
    const history = new History();
    const jspe = new JSPE({
      plugins: [history],
    });

    // start the process and the flow
    const token = await jspe.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/SwimLane.bpmn`, 'utf-8'),
    });
    await token.exec();

    setTimeout(() => {
      expect(history.store).toMatchSnapshot();
      done();
    }, 100);
  });
});

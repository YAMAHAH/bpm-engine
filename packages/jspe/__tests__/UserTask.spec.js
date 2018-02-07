import fs from 'fs';

import JSPE from 'jspe';
import History from './Plugins/History';

describe('UserTask', () => {
  it('Pauses a token and controls continuing it', async (done) => {
    const history = new History();
    const jspe = new JSPE({
      plugins: [history],
    });

    // start the process and the flow
    const token = await jspe.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/UserTask.bpmn`, 'utf-8'),
    });
    await token.exec();

    // continue the flow
    const continueToken = await jspe.continueTokenInstance({
      tokenId: token.tokenId,
    });
    await continueToken.exec();

    setTimeout(() => {
      expect(history.store).toMatchSnapshot();
      done();
    }, 100);
  });
});

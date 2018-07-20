import fs from 'fs';

import BPMEngine from 'bpm-engine';

import History from './Plugins/History';

describe('UserTask', () => {
  it('Pauses a token and controls continuing it', async () => {
    // given
    const history = new History();
    const bpm = new BPMEngine({
      plugins: [history],
    });

    const token = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/UserTask.bpmn`, 'utf-8'),
    });

    // when
    await token.execute();

    // then
    expect(token.status).toBe('paused');

    // given
    const continueToken = await bpm.continueTokenInstance({
      tokenId: token.tokenId,
    });

    // when
    await continueToken.execute();

    // then
    expect(continueToken.status).toBe('ended');
    expect(history.store).toMatchSnapshot();
  });
});

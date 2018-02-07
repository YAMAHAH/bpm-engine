import fs from 'fs';

import jspe from 'jspe';
import History from './Plugins/History';

describe('ParallelGateway', () => {
  it('Continues on all paths', async (done) => {
    const history = new History();
    const jspe = new JSPE({
      plugins: [history],
    });

    const token = await jspe.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/ParallelGateway.bpmn`, 'utf-8'),
    });

    await token.exec();
    setTimeout(() => {
      expect(history.store).toMatchSnapshot();
      done();
    }, 100);
  });

  it('Runs services in parallel', async (done) => {
    const history = new History();
    const jspe = new JSPE({
      plugins: [history],
    });

    const token = await jspe.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/ParallelServices.bpmn`, 'utf-8'),
    });

    await token.exec();
    setTimeout(() => {
      expect(history.store).toMatchSnapshot();
      done();
    }, 100);
  });
});

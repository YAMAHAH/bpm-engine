import fs from 'fs';

import JSPE from 'jspe';

describe('jspe', () => {
  it('jspe uses a default slowMotion time, when active', () => {
    const jspe = new JSPE({ slowMotion: true });
    expect(jspe).toMatchSnapshot();
  });

  it('User can define a custom slowMotion time', async () => {
    const jspe = new JSPE({ slowMotion: 100 });
    expect(jspe).toMatchSnapshot();

    const token = await jspe.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/diagrams/UserTask.bpmn`, 'utf-8'),
    });

    await token.exec();
  });

  it('User can define his own store for volatile persistance', () => {
    const jspe = new JSPE({ store: [] });
    expect(jspe).toMatchSnapshot();
  });

  it('User can define his own persistance methods', () => {
    const jspe = new JSPE({ persist: {} });
    expect(jspe).toMatchSnapshot();
  });

  it('User can define his own method for validation of conditions', () => {
    const jspe = new JSPE({ evalCondition: () => {} });
    expect(jspe).toMatchSnapshot();
  });

  it('User can define his own method for generation of resource ids', () => {
    const jspe = new JSPE({ generateId: () => {} });
    expect(jspe).toMatchSnapshot();
  });
});

import JSPE from 'jspe';

const jspe = new JSPE();

describe('Engine', () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = () => {};
  });

  afterEach(() => {
    console.error = consoleError;
  });

  it('Can not instantiate a new processInstance without a workflowDefinition', async () => {
    await expect(jspe.createProcessInstance()).rejects.toMatchSnapshot();
  });

  it('Can not instantiate a new processInstance without a "valid" workflowDefinition', async () => {
    await expect(jspe.createProcessInstance({ workflowDefinition: 'INVALID_XML' })).rejects.toMatchSnapshot();
  });
});

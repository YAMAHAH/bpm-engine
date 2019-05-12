import fs from 'fs';

import BPMEngine from 'bpm-engine';

const UserTaskDiagram = fs.readFileSync(`${__dirname}/diagrams/UserTask.bpmn`, 'utf-8');

describe('BPMEngine', () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = () => {};
  });

  afterEach(() => {
    console.error = consoleError;
  });

  it('User can define his own persistance methods', () => {
    const bpm = new BPMEngine({ persist: {} });
    expect(bpm).toMatchSnapshot();
  });

  it('User can define his own method for validation of conditions', () => {
    const bpm = new BPMEngine({ evalCondition: () => {} });
    expect(bpm).toMatchSnapshot();
  });

  it('User can define his own method for generation of resource ids', () => {
    const bpm = new BPMEngine({ generateId: () => {} });
    expect(bpm).toMatchSnapshot();
  });

  it('Can not instantiate a new processInstance without a workflowDefinition', async () => {
    const bpm = new BPMEngine();
    await expect(bpm.createProcessInstance()).rejects.toMatchSnapshot();
  });

  it('Can not instantiate a new processInstance with an invalid workflowDefinition', async () => {
    const bpm = new BPMEngine();
    await expect(bpm.createProcessInstance({ workflowDefinition: 'INVALID_XML' })).rejects.toMatchSnapshot();
  });

  it('Deploys a valid workflow definition with a custom id', async () => {
    const bpm = new BPMEngine();
    const deployedWorkflowDefinition = await bpm.deployWorkflowDefinition({
      xml: UserTaskDiagram,
      workflowDefinitionId: 'test',
    });
    const workflowDefinition = await bpm.persist.workflowDefinitions.find({
      workflowDefinitionId: deployedWorkflowDefinition.workflowDefinitionId,
    });
    expect(workflowDefinition).toMatchSnapshot();
  });

  it('Deploys a valid workflow definition with a random id', async () => {
    const bpm = new BPMEngine();
    const deployedWorkflowDefinition = await bpm.deployWorkflowDefinition({
      xml: UserTaskDiagram,
    });
    const workflowDefinition = await bpm.persist.workflowDefinitions.find({
      workflowDefinitionId: deployedWorkflowDefinition.workflowDefinitionId,
    });
    expect(workflowDefinition).not.toBeFalsy();
  });

  it('Can create a new processInstance by deployed workflowDefinition', async () => {
    const bpm = new BPMEngine();
    const deployedWorkflowDefinition = await bpm.deployWorkflowDefinition({
      xml: UserTaskDiagram,
    });

    const token = await bpm.createProcessInstance({
      workflowDefinitionId: deployedWorkflowDefinition.workflowDefinitionId,
    });
    expect(token).not.toBeFalsy();
  });
});

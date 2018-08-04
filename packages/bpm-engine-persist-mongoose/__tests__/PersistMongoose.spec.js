import BPMEngine from 'bpm-engine';
import fs from 'fs';
import Promise from 'bluebird';

import mongoose from 'mongoose';

mongoose.Promise = Promise;

import PersistMongoose from 'bpm-engine-persist-mongoose';

import History from '../../bpm-engine/__tests__/Plugins/History';

describe('PersistMongoose', () => {
  let persistMongoose;

  beforeEach(async () => {
    persistMongoose = new PersistMongoose('mongodb://localhost:27017/bpm-engine-testing', {
      useMongoClient: true,
    });

    // clear process instances, token instances and deployed workflowDefinitions
    await persistMongoose.schemas.processInstance.remove({}).exec();
    await persistMongoose.schemas.tokenInstance.remove({}).exec();
    await persistMongoose.schemas.workflowDefinition.remove({}).exec();
    await persistMongoose.schemas.timers.remove({}).exec();
  });

  afterEach(async () => {
    await persistMongoose.connection.close();
  });

  it('Creates a process instance by xml', async () => {
    const history = new History();

    const bpm = new BPMEngine({
      plugins: [history],
      persist: persistMongoose,
    });

    const processInstance = await bpm.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/ParallelServices.bpmn`, 'utf-8'),
    });

    await processInstance.execute();

    expect((await persistMongoose.schemas.processInstance.find()).length).toMatchSnapshot();
    expect((await persistMongoose.schemas.tokenInstance.find()).length).toMatchSnapshot();
    expect(history.store).toMatchSnapshot();
  });

  it('Can deploy a workflow definition', async () => {
    const bpm = new BPMEngine({
      persist: persistMongoose,
    });

    await bpm.deployWorkflowDefinition({
      xml: fs.readFileSync(`${__dirname}/ParallelServices.bpmn`, 'utf-8'),
    });

    expect((await persistMongoose.schemas.workflowDefinition.find()).length).toMatchSnapshot();
  });

  it('Can create a process instance from a deployed workflowDefinition', async () => {
    const bpm = new BPMEngine({
      persist: persistMongoose,
    });

    const deployedWorkflowDefinition = await bpm.deployWorkflowDefinition({
      xml: fs.readFileSync(`${__dirname}/ParallelServices.bpmn`, 'utf-8'),
    });

    const processInstance = await bpm.createProcessInstance({
      workflowDefinitionId: deployedWorkflowDefinition.workflowDefinitionId,
    });

    expect(processInstance).not.toBeFalsy();
  });

  it('Can create a process instance with a timer start event', async (done) => {
    const bpm = new BPMEngine({
      persist: persistMongoose,
    });

    await bpm.deployWorkflowDefinition({
      xml: fs.readFileSync(`${__dirname}/TimerStartEvent.bpmn`, 'utf-8'),
    });

    setTimeout(() => {
      done();
    }, 4000);
  });
});

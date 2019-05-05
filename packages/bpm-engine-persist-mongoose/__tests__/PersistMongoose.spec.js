import BPMEngine from 'bpm-engine';
import fs from 'fs';
import Promise from 'bluebird';

import mongoose from 'mongoose';

import PersistMongoose from 'bpm-engine-persist-mongoose';

import History from '../../bpm-engine/__tests__/Plugins/History';
import sleep from '../../bpm-engine/__tests__/Plugins/sleep';

mongoose.Promise = Promise;

describe('PersistMongoose', () => {
  let persistMongoose;

  beforeEach(async () => {
    persistMongoose = new PersistMongoose('mongodb://localhost:27017/bpm-engine-testing', {
      useNewUrlParser: true,
    });

    // clear collections
    await persistMongoose.schemas.processInstance.remove({});
    await persistMongoose.schemas.tokenInstance.remove({});
    await persistMongoose.schemas.workflowDefinition.remove({});
    await persistMongoose.schemas.timer.remove({});
    await persistMongoose.schemas.task.remove({});
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

  it('Can create a process instance with a timer start event', async () => {
    const bpm = new BPMEngine({
      persist: persistMongoose,
    });

    await bpm.deployWorkflowDefinition({
      xml: fs.readFileSync(`${__dirname}/TimerStartEvent.bpmn`, 'utf-8'),
    });

    await sleep(3000);
    const results = await persistMongoose.schemas.processInstance.find();
    expect(results.length).toBe(3);
  });

  it('multiple deploys of the same workfowDefinition should replace existing timers', async () => {
    const engine = new BPMEngine({
      persist: persistMongoose,
    });

    await engine.deployWorkflowDefinition({
      xml: fs.readFileSync(`${__dirname}/TimerStartEvent.bpmn`, 'utf-8'),
      workflowDefinitionId: 'timerStartEvent',
    });

    await sleep(1500);
    let timers = await persistMongoose.schemas.timer.find();
    let lastTimer = timers[2];

    expect(lastTimer.status).toBeFalsy();

    await engine.deployWorkflowDefinition({
      xml: fs.readFileSync(`${__dirname}/TimerStartEvent.bpmn`, 'utf-8'),
      workflowDefinitionId: 'timerStartEvent',
    });

    timers = await persistMongoose.schemas.timer.find();
    lastTimer = timers[2];
    expect(lastTimer.status).toEqual('done');

    await sleep(1500);
    timers = await persistMongoose.schemas.timer.find();
    lastTimer = timers[5];
    expect(lastTimer.status).toBeFalsy();
  });
});

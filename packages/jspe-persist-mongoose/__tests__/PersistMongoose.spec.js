import JSPE from 'jspe';
import fs from 'fs';
import Promise from 'bluebird';
import mongoose from 'mongoose';

mongoose.Promise = Promise;

import PersistMongoose from 'jspe-persist-mongoose';

import History from '../../jspe/__tests__/Plugins/History';

describe('PersistMongoose', () => {
  it('Work', async () => {
    const persistMongoose = new PersistMongoose('mongodb://localhost:27017/jspe-testing', {
      useMongoClient: true,
    });

    await persistMongoose.schemas.processInstance.remove({}).exec();
    await persistMongoose.schemas.tokenInstance.remove({}).exec();

    const history = new History();

    const jspe = new JSPE({
      plugins: [history],
      persist: persistMongoose,
    });

    const token = await jspe.createProcessInstance({
      workflowDefinition: fs.readFileSync(`${__dirname}/ParallelServices.bpmn`, 'utf-8'),
    });

    await token.exec();
    expect((await persistMongoose.schemas.processInstance.find({})).length).toMatchSnapshot();
    expect((await persistMongoose.schemas.tokenInstance.find({})).length).toMatchSnapshot();
    expect(history.store).toMatchSnapshot();
    await persistMongoose.client.close();
  });
});

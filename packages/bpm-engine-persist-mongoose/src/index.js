import 'source-map-support/register';
import mongoose from 'mongoose';

// mongoose.set('debug', true);

import schemaInitializer from './schema-initializer';

export default class MongoosePersist {
  constructor(options, connectionOptions = {}, names) {
    this.connection = mongoose.connect(
      options,
      connectionOptions,
    );
    this.schemas = schemaInitializer(this.connection, names);
  }

  processInstance = {
    create: obj => this.schemas.processInstance.create(obj),
    update: (query, patch) =>
      this.schemas.processInstance.findOneAndUpdate(query, patch, { new: true }),
    find: query => this.schemas.processInstance.findOne(query),
  };

  tokenInstance = {
    create: obj => this.schemas.tokenInstance.create(obj),
    update: (query, patch) =>
      this.schemas.tokenInstance.findOneAndUpdate(query, patch, { new: true }),
    find: query => this.schemas.tokenInstance.findOne(query),
  };

  workflowDefinition = {
    create: obj => this.schemas.workflowDefinition.create(obj),
    find: query => this.schemas.workflowDefinition.findOne(query),
    update: (query, patch) =>
      this.schemas.workflowDefinition.findOneAndUpdate(query, patch, { new: true }),
  };

  timers = {
    create: obj => this.schemas.timers.create(obj),
    find: query => this.schemas.timers.findOne(query),
    update: (query, patch) => this.schemas.timers.findOneAndUpdate(query, patch, { new: true }),
    getNext: async (time) => {
      const allTimers = await this.schemas.timers.find({ status: { $ne: 'done' } });

      const timers = allTimers
        .map(a => Object.assign(a, { timeLeft: a.time - time }))
        .filter(a => a.timeLeft <= 0)
        .sort((a, b) => a.timeLeft < b.timeLeft);

      return timers[0];
    },
  };

  tasks = {
    create: obj => this.schemas.tasks.create(obj),
    find: query => this.schemas.tasks.find(query),
  };
}

import 'source-map-support/register';
import mongoose from 'mongoose';

// mongoose.set('debug', true);

import schemaInitializer from './schema-initializer';

export default class MongoosePersist {
  constructor(options, connectionOptions = {}, names) {
    this.connection = mongoose.createConnection(options, connectionOptions);
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

  timer = {
    create: obj => this.schemas.timer.create(obj),
    find: query => this.schemas.timer.findOne(query),
    update: (query, patch) => this.schemas.timer.findOneAndUpdate(query, patch, { new: true }),
    getNext: async (time) => {
      // get undone timers
      const allTimers = await this.schemas.timer.find({ status: { $ne: 'done' } });

      const timers = allTimers
        // calculate how many seconds each timer has left until it needs to be handled
        .map(a => Object.assign(a, { timeLeft: a.time - time }))
        // filter out only timers which are expired or expiring just now, other timers
        // need to be handled in the future.
        .filter(a => a.timeLeft <= 0)
        // from all those filtered, get the oldest one, which has the highest urgency to get handled
        .sort((a, b) => a.timeLeft < b.timeLeft);

      return timers[0];
    },
  };

  tasks = {
    create: obj => this.schemas.task.create(obj),
    find: query => this.schemas.task.find(query),
  };
}

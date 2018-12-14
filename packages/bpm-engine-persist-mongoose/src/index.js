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
      this.schemas.processInstance.findOneAndUpdate(query, patch, { new: true }).lean(),
    find: query => this.schemas.processInstance.findOne(query).lean(),
  };

  tokenInstance = {
    create: obj => this.schemas.tokenInstance.create(obj),
    update: (query, patch) =>
      this.schemas.tokenInstance.findOneAndUpdate(query, patch, { new: true }).lean(),
    find: query => this.schemas.tokenInstance.findOne(query).lean(),
  };

  workflowDefinition = {
    create: obj => this.schemas.workflowDefinition.create(obj),
    find: query => this.schemas.workflowDefinition.findOne(query).lean(),
    update: (query, patch) =>
      this.schemas.workflowDefinition.findOneAndUpdate(query, patch, { new: true }).lean(),
  };

  timer = {
    create: obj => this.schemas.timer.create(obj),
    find: query => this.schemas.timer.findOne(query),
    update: (query, patch, options = {}) =>
      this.schemas.timer.update(query, patch, { ...options, new: true }).lean(),
    getNext: async (time) => {
      // get all timers where status is not 'done'
      // add a calculated field which is the time of creation of the timer and the time provided in this method as an argument
      // filter out only timers which are lower than or equal 0
      // sort the older ones on top
      // only give the oldest
      const aggregation = [
        { $match: { status: { $ne: 'done' } } },
        { $addFields: { timeLeft: { $subtract: ['$time', time] } } },
        { $match: { timeLeft: { $lte: 0 } } },
        { $sort: { timeLeft: 1 } },
        { $limit: 1 },
      ];

      const timers = await this.schemas.timer.aggregate(aggregation);

      return timers[0];
    },
  };

  task = {
    create: obj => this.schemas.task.create(obj),
    find: query => this.schemas.task.find(query).lean(),
  };
}

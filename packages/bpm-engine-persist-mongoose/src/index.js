import 'source-map-support/register';
import mongoose from 'mongoose';

import schemas from 'schemas';

export default class MongoosePersist {
  constructor(options, connectionOptions = {}, names) {
    this.connection = mongoose.connect(
      options,
      connectionOptions,
    );
    this.schemas = schemas(this.connection, names);
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
}

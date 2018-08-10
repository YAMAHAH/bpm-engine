import mongoose from 'mongoose';

const { Schema } = mongoose;
const { Types } = Schema;

const ProcessInstanceSchema = new Schema(
  {
    processId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
    },
    workflowDefinition: {
      type: String,
      required: true,
    },
    payload: {
      type: Types.Mixed,
    },
  },
  { timestamps: true, minimize: false },
);

export default ProcessInstanceSchema;

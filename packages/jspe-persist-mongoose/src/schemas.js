import mongoose from 'mongoose';

const { Schema } = mongoose;
const { Types } = Schema;

const TokenInstanceSchema = new Schema(
  {
    processId: {
      type: String,
      required: true,
    },
    tokenId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['started', 'running', 'paused', 'ended'],
    },
    currentActivity: {
      type: String,
    },
    payload: {
      type: Types.Mixed,
    },
    childs: {
      type: Array,
    },
    pending: {
      type: Array,
    },
    parent: {
      type: String,
    },
    isSubProcess: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, minimize: false },
);

const ProcessInstanceSchema = new Schema(
  {
    processId: {
      type: String,
      required: true,
      unique: true,
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

export default (client, names = {}) => ({
  tokenInstance: client.model(names.tokenInstance || 'jspe_tokenInstance', TokenInstanceSchema),
  processInstance: client.model(
    names.processInstance || 'jspe_processInstance',
    ProcessInstanceSchema,
  ),
});

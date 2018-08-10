import mongoose from 'mongoose';

const { Schema } = mongoose;
const { Types } = Schema;

const TokenInstanceSchema = new Schema(
  {
    processId: {
      type: String,
      required: true,
      index: true,
    },
    tokenId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['running', 'paused', 'ended'],
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

export default TokenInstanceSchema;

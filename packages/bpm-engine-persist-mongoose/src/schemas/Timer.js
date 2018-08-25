import mongoose from 'mongoose';

const { Schema } = mongoose;

const TimerSchema = new Schema(
  {
    timerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    workflowDefinitionId: {
      type: String,
      index: true,
    },
    tokenId: {
      type: String,
      index: true,
    },
    intent: {
      type: String,
      required: true,
    },
    interval: {
      type: String,
      required: true,
    },
    time: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
    },
    index: {
      type: Number,
    },
    previousTimerId: {
      type: String,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

export default TimerSchema;

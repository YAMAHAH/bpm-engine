import mongoose from 'mongoose';

const { Schema } = mongoose;
const { Types } = Schema;

const TaskSchema = new Schema(
  {
    taskId: {
      type: String,
      unique: true,
      index: true,
    },
    definition: {
      type: String,
    },
    processId: {
      type: String,
      required: true,
      index: true,
    },
    tokenId: {
      type: String,
      required: true,
      index: true,
    },
    payload: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    assignedAt: {
      type: Date,
    },
    assignedTo: {
      type: Types.Mixed,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

export default TaskSchema;

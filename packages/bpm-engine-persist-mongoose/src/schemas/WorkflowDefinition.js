import mongoose from 'mongoose';

const { Schema } = mongoose;

const WorkflowDefinitionSchema = new Schema(
  {
    workflowDefinitionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    processName: {
      type: String,
      required: true,
      unique: true,
    },
    xml: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, minimize: false },
);

export default WorkflowDefinitionSchema;

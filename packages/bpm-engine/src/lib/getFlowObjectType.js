import {
  StartEvent,
  EndEvent,
  UserTask,
  ServiceTask,
  ExclusiveGateway,
  Task,
  ParallelGateway,
  SequenceFlow,
  InclusiveGateway,
  SubProcess,
  IntermediateCatchEvent,
  ScriptTask,
} from 'lib/Elements';

import {
  BPMN_EVENT_START,
  BPMN_EVENT_INTERMEDIATE_CATCH,
  BPMN_EVENT_END,
  BPMN_TASK,
  BPMN_TASK_USER,
  BPMN_TASK_SERVICE,
  BPMN_TASK_SCRIPT,
  BPMN_GATEWAY_EXCLUSIVE,
  BPMN_GATEWAY_INCLUSIVE,
  BPMN_GATEWAY_PARALLEL,
  BPMN_SEQUENCEFLOW,
  BPMN_SUBPROCESS,
} from 'lib/constants';

const typeMap = {
  [BPMN_EVENT_START]: StartEvent,
  [BPMN_EVENT_INTERMEDIATE_CATCH]: IntermediateCatchEvent,
  [BPMN_EVENT_END]: EndEvent,

  [BPMN_TASK]: Task,
  [BPMN_TASK_USER]: UserTask,
  [BPMN_TASK_SERVICE]: ServiceTask,
  [BPMN_TASK_SCRIPT]: ScriptTask,

  [BPMN_GATEWAY_EXCLUSIVE]: ExclusiveGateway,
  [BPMN_GATEWAY_INCLUSIVE]: InclusiveGateway,
  [BPMN_GATEWAY_PARALLEL]: ParallelGateway,

  [BPMN_SEQUENCEFLOW]: SequenceFlow,
  [BPMN_SUBPROCESS]: SubProcess,
};

export default (flowObjectDefinition) => {
  const FlowObjectType = typeMap[flowObjectDefinition.$type];
  /* istanbul ignore next */
  if (!FlowObjectType) {
    throw new Error(`FlowObjectType '${flowObjectDefinition.$type}' is not implemented`);
  }
  return FlowObjectType;
};

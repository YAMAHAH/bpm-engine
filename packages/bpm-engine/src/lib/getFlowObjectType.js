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

const typeMap = {
  'bpmn:StartEvent': StartEvent,
  'bpmn:UserTask': UserTask,
  'bpmn:EndEvent': EndEvent,
  'bpmn:ServiceTask': ServiceTask,
  'bpmn:ExclusiveGateway': ExclusiveGateway,
  'bpmn:InclusiveGateway': InclusiveGateway,
  'bpmn:Task': Task,
  'bpmn:ParallelGateway': ParallelGateway,
  'bpmn:SequenceFlow': SequenceFlow,
  'bpmn:SubProcess': SubProcess,
  'bpmn:IntermediateCatchEvent': IntermediateCatchEvent,
  'bpmn:ScriptTask': ScriptTask,
};

export default (flowObjectDefinition) => {
  const FlowObjectType = typeMap[flowObjectDefinition.$type];
  /* istanbul ignore next */
  if (!FlowObjectType) {
    throw new Error(`FlowObjectType '${flowObjectDefinition.$type}' is not yet implemented`);
  }
  return FlowObjectType;
};

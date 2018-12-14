import ProcessInstanceSchema from 'schemas/ProcessInstance';
import TokenInstanceSchema from 'schemas/TokenInstance';
import WorkflowDefinitionSchema from 'schemas/WorkflowDefinition';
import TimerSchema from 'schemas/Timer';
import TaskSchema from 'schemas/Task';

const DEFAULTS = {
  tokenInstance: 'bpmEngine_tokenInstances',
  processInstance: 'bpmEngine_processInstances',
  workflowDefinition: 'bpmEngine_workflowDefinitions',
  timer: 'bpmEngine_timers',
  task: 'bpmEngine_tasks',
};

export default (client, names = {}) => ({
  tokenInstance: client.model(names.tokenInstance || DEFAULTS.tokenInstance, TokenInstanceSchema),
  processInstance: client.model(
    names.processInstance || DEFAULTS.processInstance,
    ProcessInstanceSchema,
  ),
  workflowDefinition: client.model(
    names.workflowDefinition || DEFAULTS.workflowDefinition,
    WorkflowDefinitionSchema,
  ),
  timer: client.model(names.timer || DEFAULTS.timer, TimerSchema),
  task: client.model(names.task || DEFAULTS.task, TaskSchema),
});

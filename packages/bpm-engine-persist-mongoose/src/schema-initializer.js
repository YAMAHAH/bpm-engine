import ProcessInstanceSchema from 'schemas/ProcessInstance';
import TokenInstanceSchema from 'schemas/TokenInstance';
import WorkflowDefinitionSchema from 'schemas/WorkflowDefinition';
import TimerSchema from 'schemas/Timer';
import TaskSchema from 'schemas/Task';

export default (client, names = {}) => ({
  tokenInstance: client.model(
    names.tokenInstance || 'bpmEngine_tokenInstances',
    TokenInstanceSchema,
  ),
  processInstance: client.model(
    names.processInstance || 'bpmEngine_processInstances',
    ProcessInstanceSchema,
  ),
  workflowDefinition: client.model(
    names.workflowDefinition || 'bpmEngine_workflowDefinitions',
    WorkflowDefinitionSchema,
  ),
  timers: client.model(names.timers || 'bpmEngine_timers', TimerSchema),
  tasks: client.model(names.tasks || 'bpmEngine_tasks', TaskSchema),
});

const findByProcessId = processId => el => el.processId === processId;

/**
 * updateProcessInstance(
 *  { processId: '123' },
 *  { status: 'running' },
 *  <store containing processInstances>
 * )
 * @param {*} query
 * @param {*} obj
 * @param {*} store
 * @returns new object containing the mapped process instance
 */
export const updateProcessInstance = (query, obj, processInstances) => {
  const json = JSON.parse(JSON.stringify(obj));

  const processInstance = processInstances.find(findByProcessId(query.processId));
  Object.assign(processInstance, json);

  return JSON.parse(JSON.stringify(processInstance));
};

/**
 * createProcessInstance(
 *  { processId: '123' },
 *  <store containing processInstances>
 * )
 * @param {*} obj
 * @param {*} store
 * @returns new object containing key/values from the obj
 */
export const createProcessInstance = (json, processInstances) => {
  processInstances.push(json);
  return JSON.parse(JSON.stringify(json));
};

export const findProcessInstance = (query, processInstances) => {
  const processInstance = processInstances.find(findByProcessId(query.processId));
  return JSON.parse(JSON.stringify(processInstance));
};

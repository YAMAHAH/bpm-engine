const getNextFlowObjects = (flowObjects, nextId) => {
  let result;
  if (flowObjects.find(el => el.id === nextId)) {
    result = flowObjects;
  }
  else {
    flowObjects.forEach((el) => {
      if (el.flowElements && !result) {
        result = getNextFlowObjects(el.flowElements, nextId);
      }
    });
  }

  return result;
};

export default getNextFlowObjects;

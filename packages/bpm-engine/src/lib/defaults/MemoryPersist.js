const findByProcessId = processId => el => el.processId === processId;

/**
 * findByQuery
 * @param {*} query
 * @returns tokenInstance or null
 */
const findByQuery = query => (el) => {
  let found = true;

  Object.keys(query).forEach((key) => {
    if (el[key] !== query[key]) {
      found = false;
    }
  });

  return found;
};

const remapPull = (json, tokenInstance) => {
  const pull = json.$pull;
  let index;
  if (pull) {
    delete json.$pull;
    const key = Object.keys(pull)[0];
    if (tokenInstance[key]) {
      index = tokenInstance[key].indexOf(pull[key]);
    }
    if (index !== -1) {
      tokenInstance[key].splice(index, 1);
    }
  }
};

const remapSet = (json) => {
  const set = json.$set;
  if (set) {
    delete json.$set;
  }
  Object.assign(json, set);
};

const createEmptyStore = () =>
  Object.create({
    processInstances: [],
    tokenInstances: [],
  });

export default class MemoryPersist {
  constructor({ store = createEmptyStore() } = {}) {
    this.store = store;

    if (!this.store.processInstances) {
      throw new Error('A store provided to the persisting-layer needs to have a processInstances key-value which will contain the collection of token instances');
    }
    if (!this.store.tokenInstances) {
      throw new Error('A store provided to the persisting-layer needs to have a tokenInstances key-value which will contain the collection of token instances');
    }
  }

  processInstance = {
    create: (json) => {
      this.store.processInstances.push(json);
      return JSON.parse(JSON.stringify(json));
    },

    find: (query) => {
      const processInstance = this.store.processInstances.find(findByProcessId(query.processId));
      return JSON.parse(JSON.stringify(processInstance));
    },

    update: (query, obj) => {
      const json = JSON.parse(JSON.stringify(obj));

      const processInstance = this.store.processInstances.find(findByProcessId(query.processId));
      Object.assign(processInstance, json);

      return JSON.parse(JSON.stringify(processInstance));
    },
  };

  tokenInstance = {
    create: (obj) => {
      this.store.tokenInstances.push(obj);
      return JSON.parse(JSON.stringify(obj));
    },

    find: (query) => {
      const tokenInstance = this.store.tokenInstances.find(findByQuery(query));
      return tokenInstance && JSON.parse(JSON.stringify(tokenInstance));
    },

    update: (query, obj) => {
      const json = JSON.parse(JSON.stringify(obj));

      const tokenInstance = this.store.tokenInstances.find(findByQuery(query));

      if (!tokenInstance) {
        throw new Error(`tokenInstance not found ${query.tokenId}`);
      }

      remapSet(json);
      remapPull(json, tokenInstance);

      Object.assign(tokenInstance, json);

      return JSON.parse(JSON.stringify(tokenInstance));
    },
  };
}

import debug from 'lib/debug';

const log = debug('persist');

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
    workflowDefinitions: [],
    timers: [],
    tasks: [],
  });

export default class MemoryPersist {
  constructor({ store = createEmptyStore() } = {}) {
    this.store = store;

    log('creating persistence instance');

    if (!this.store.processInstances) {
      throw new Error('A store provided to the persisting-layer needs to have a processInstances key-value which will contain a collection of token instances');
    }
    if (!this.store.tokenInstances) {
      throw new Error('A store provided to the persisting-layer needs to have a tokenInstances key-value which will contain a collection of token instances');
    }
    if (!this.store.workflowDefinitions) {
      throw new Error('A store provided to the persisting-layer needs to have a workflowDefinitions key-value which will contain a collection of workflow definitions');
    }
    if (!this.store.timers) {
      throw new Error('A store provided to the persisting-layer needs to have a timers key-value which will contain a collection of timers');
    }
    if (!this.store.tasks) {
      throw new Error('A store provided to the persisting-layer needs to have a tasks key-value which will contain a collection of tasks');
    }
  }

  processInstance = {
    create: (json) => {
      log('create process');
      this.store.processInstances.push(json);
      return JSON.parse(JSON.stringify(json));
    },

    find: (query) => {
      log('find process', query);
      const processInstance = this.store.processInstances.find(findByProcessId(query.processId));
      return JSON.parse(JSON.stringify(processInstance));
    },

    update: (query, obj) => {
      log('update process', query, obj);
      const json = JSON.parse(JSON.stringify(obj));

      const processInstance = this.store.processInstances.find(findByProcessId(query.processId));
      remapSet(json);
      Object.assign(processInstance, json);

      return JSON.parse(JSON.stringify(processInstance));
    },
  };

  tokenInstance = {
    create: (obj) => {
      log('create token', obj);
      this.store.tokenInstances.push(obj);
      return JSON.parse(JSON.stringify(obj));
    },

    find: (query) => {
      log('find token', query);
      const tokenInstance = this.store.tokenInstances.find(findByQuery(query));
      return tokenInstance && JSON.parse(JSON.stringify(tokenInstance));
    },

    update: (query, obj) => {
      log('update token', query, obj);
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

  workflowDefinition = {
    create: (obj) => {
      log('create workflowDefinition (deploy)', obj);
      this.store.workflowDefinitions.push(obj);
      return JSON.parse(JSON.stringify(obj));
    },

    find: (query) => {
      log('find workflowDefinition', query);
      const workflowDefinition = this.store.workflowDefinitions.find(findByQuery(query));
      return workflowDefinition && JSON.parse(JSON.stringify(workflowDefinition));
    },

    update: (query, obj) => {
      log('update workflowDefinition', query, obj);
      const json = JSON.parse(JSON.stringify(obj));

      const workflowDefinition = this.store.timers.find(findByQuery(query));

      if (workflowDefinition) {
        remapSet(json);
        remapPull(json, workflowDefinition);

        Object.assign(workflowDefinition, json);

        return JSON.parse(JSON.stringify(workflowDefinition));
      }
    },
  };

  timer = {
    create: (obj) => {
      log('create timer', obj);
      this.store.timers.push(obj);
      return JSON.parse(JSON.stringify(obj));
    },

    find: (query) => {
      log('find timer', query);
      const timer = this.store.timers.find(findByQuery(query));
      return timer && JSON.parse(JSON.stringify(timer));
    },

    getNext: (time) => {
      log('find next timer');
      const timers = this.store.timers
        .filter(a => a.status !== 'done')
        .map(a => Object.assign(a, { timeLeft: a.time - time }))
        .filter(a => a.timeLeft <= 0)
        .sort((a, b) => a.timeLeft < b.timeLeft);

      return timers[0] && JSON.parse(JSON.stringify(timers[0]));
    },

    update: (query, obj) => {
      log('update timer', query, obj);
      const json = JSON.parse(JSON.stringify(obj));

      const timer = this.store.timers.find(findByQuery(query));

      if (timer) {
        remapSet(json);
        remapPull(json, timer);

        Object.assign(timer, json);

        return JSON.parse(JSON.stringify(timer));
      }
    },
  };

  task = {
    create: (obj) => {
      log('create task', obj);
      this.store.tasks.push(obj);
      return JSON.parse(JSON.stringify(obj));
    },

    find: (query) => {
      log('find tasks', query);
      return this.store.tasks.find(findByQuery(query));
    },
  };
}

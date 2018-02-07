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

/**
 * findByQuery
 * @param {*} query
 * @returns tokenInstance or null
 */
const findByQuery = query => (el) => {
  let found = true;

  for (const key in query) {
    if (el[key] !== query[key]) {
      found = false;
    }
  }

  return found;
};

/**
 * updateTokenInstance(
 *  { tokenId: '123' },
 *  { status: 'running' },
 *  <store containing token instances>
 * )
 * @param {*} query
 * @param {*} obj
 * @param {*} store
 * @returns new object containing the mapped token instance
 */
export const updateTokenInstance = (query, obj, tokenInstances) => {
  const json = JSON.parse(JSON.stringify(obj));

  const tokenInstance = tokenInstances.find(findByQuery(query));

  if (!tokenInstance) {
    throw new Error(`tokenInstance not found ${query.tokenId}`);
  }

  remapSet(json);
  remapPull(json, tokenInstance);

  Object.assign(tokenInstance, json);

  return JSON.parse(JSON.stringify(tokenInstance));
};

/**
 * createTokenInstance(
 *  { tokenId: '123' },
 *  <store containing token instances>
 * )
 * @param {*} obj
 * @param {*} store
 * @returns new object containing key/values from the obj
 */
export const createTokenInstance = (obj, tokenInstances) => {
  tokenInstances.push(obj);
  return JSON.parse(JSON.stringify(obj));
};

export const findTokenInstance = (query, tokenInstances) => {
  const tokenInstance = tokenInstances.find(findByQuery(query));
  return tokenInstance && JSON.parse(JSON.stringify(tokenInstance));
};

import {
  createProcessInstance,
  updateProcessInstance,
  findProcessInstance,
} from './processInstance';
import { createTokenInstance, updateTokenInstance, findTokenInstance } from './tokenInstance';

/**
 *
 */
const createStore = () =>
  Object.create({
    processInstances: [],
    tokenInstances: [],
  });

/**
 *
 */
export default {
  processInstance: {
    create: createProcessInstance,
    update: updateProcessInstance,
    find: findProcessInstance,
  },
  tokenInstance: {
    create: createTokenInstance,
    update: updateTokenInstance,
    find: findTokenInstance,
  },
  createStore,
};

import shortid from 'shortid';
import jexl from 'jexl';

import MemoryPersist from './MemoryPersist';

const generateId = () => shortid.generate();
const evalCondition = (expression, context) => jexl.eval(expression, context);

export default {
  generateId,
  evalCondition,
  MemoryPersist,
};

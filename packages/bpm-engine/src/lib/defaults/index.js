import shortid from 'shortid';
import jexl from 'jexl';

import persist from 'lib/defaults/persist';

const generateId = () => shortid.generate();
const evalCondition = (expression, context) => jexl.eval(expression, context);

export default {
  generateId,
  evalCondition,
  persist,
};

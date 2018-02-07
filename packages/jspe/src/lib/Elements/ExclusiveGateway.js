import Gateway from 'lib/Elements/Gateway';

export default class ExclusiveGateway extends Gateway {
  makeActive = async () => {
    const { outgoing } = this.definition;
    const { payload } = this.tokenInstance;

    await this.triggerState('active');

    const next = [];

    if (outgoing.length > 1) {
      // eslint-disable-next-line
      for (const path of outgoing) {
        if (path.conditionExpression) {
          const { conditionExpression } = path;
          // eslint-disable-next-line
          (await this.evalCondition(conditionExpression.body, payload)) && next.push(path);
        }
      }
    }
    else {
      [this.next] = outgoing;
      return;
    }

    if (next.length > 1) {
      return;
    }

    if (next.length === 1) {
      [this.next] = next;
    }

    if (!next.length) {
      if (this.definition.default) {
        this.next = this.definition.default;
      }
    }
  };
}

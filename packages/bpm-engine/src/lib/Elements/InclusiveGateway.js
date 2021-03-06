import Gateway from 'lib/Elements/Gateway';

export default class InclusiveGateway extends Gateway {
  makeReady = async () => {
    await this.callPlugins('onReady');

    // if this token has a parent
    // we pull ourselves out of its childs
    if (this.tokenInstance.parent) {
      const parentToken = await this.persist.tokenInstances.update(
        {
          tokenId: this.tokenInstance.parent,
        },
        {
          $pull: { childs: this.tokenInstance.tokenId },
        },
      );

      // if there are still childs left
      // we set us to be paused, since only the last
      // token should be continued
      if (parentToken.childs.length > 0) {
        this.tokenInstance.status = 'paused';
      }
    }
  };

  async getNext() {
    const { outgoing } = this.definition;
    const { payload } = this.tokenInstance;

    const next = [];
    if (outgoing.length > 1) {
      for (const path of outgoing) {
        if (path.conditionExpression) {
          const { conditionExpression } = path;
          (await this.evalCondition(conditionExpression.body, payload)) && next.push(path);
        }
      }
    }
    else {
      next.push(outgoing[0]);
    }
    return next;
  }

  makeComplete = async () => {
    const { outgoing } = this.definition;

    await this.callPlugins('onComplete');

    if (outgoing.length > 1) {
      const next = await this.getNext();

      if (!next.length) {
        if (this.definition.default) {
          next.push(this.definition.default);
        }
        else {
          return;
        }
      }

      const childTokenInstances = await this.instantiateChildTokenInstances(next);
      this.tokenInstance.status = 'paused';
      await this.processChilds(childTokenInstances);
    }
  };
}

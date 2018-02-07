import Event from 'lib/Elements/Event';

export default class EndEvent extends Event {
  makeComplete = async () => {
    this.tokenInstance.status = 'ended';
    await this.triggerState('complete');

    await this.persist.tokenInstance.update(
      {
        tokenId: this.tokenInstance.tokenId,
      },
      { $set: this.tokenInstance.toJSON() },
      this.engine.store.tokenInstances,
    );

    if (this.tokenInstance.parent && this.tokenInstance.isSubProcess) {
      const parentToken = await this.persist.tokenInstance.update(
        {
          tokenId: this.tokenInstance.parent,
        },
        {
          $pull: { childs: this.tokenInstance.tokenId },
        },
        this.engine.store.tokenInstances,
      );

      // continue with parent token
      const cleanPayload = this.tokenInstance.payload;
      delete cleanPayload._;
      if (parentToken.childs.length === 0) {
        const ti = await this.engine.continueTokenInstance({
          tokenId: parentToken.tokenId,
          payload: cleanPayload,
          parent: parentToken.parent,
          meta: this.tokenInstance.meta,
          processId: this.tokenInstance.processId,
          isSubProcess: parentToken.isSubProcess,
        });

        return ti.exec();
      }
    }
    else {
      await this.persist.processInstance.update(
        {
          processId: this.tokenInstance.processId,
        },
        {
          $set: {
            status: 'ended',
          },
        },
        this.engine.store.processInstances,
      );
    }
  };
}

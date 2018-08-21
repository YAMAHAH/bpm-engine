import Event from 'lib/Elements/Event';

export default class EndEvent extends Event {
  makeComplete = async () => {
    this.tokenInstance.status = 'ended';
    await this.callPlugins('onComplete');

    await this.tokenInstance.persistUpdate();

    // if this end-event is inside a sub process, continue with the outer flow
    if (this.tokenInstance.parent && this.tokenInstance.isSubProcess) {
      const parentToken = await this.persist.tokenInstance.update(
        {
          tokenId: this.tokenInstance.parent,
        },
        {
          $pull: { childs: this.tokenInstance.tokenId },
        },
      );

      // continue with parent token
      const cleanPayload = this.tokenInstance.payload;
      delete cleanPayload._;

      if (parentToken.childs.length === 0) {
        const ti = await this.engine.continueTokenInstance({
          tokenId: parentToken.tokenId,
          payload: cleanPayload,
          parent: parentToken.parent,
          processId: this.tokenInstance.processId,
          isSubProcess: parentToken.isSubProcess,
        });

        return ti.execute();
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
      );
    }
  };
}

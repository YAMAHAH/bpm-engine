import Gateway from 'lib/Elements/Gateway';
import serial from 'lib/serial';

export default class ParallelGateway extends Gateway {
  makeReady = async () => {
    await this.triggerState('ready');
    const { incoming } = this.definition;
    if (incoming.length > 1) {
      // did any other waiting token arrive here yet?
      const anyOtherToken = await this.persist.tokenInstance.find({
        processId: this.tokenInstance.processId,
        status: 'paused',
        currentActivity: this.definition.id,
      });

      // use this token as the first which arrived
      if (!anyOtherToken) {
        const pending = incoming.map(el => el.id);
        const index = pending.indexOf(this.tokenInstance.lastActivity);

        if (index !== -1) {
          pending.splice(index, 1);
        }

        await this.persist.tokenInstance.update(
          {
            tokenId: this.tokenInstance.tokenId,
          },
          {
            $set: {
              currentActivity: this.definition.id,
              status: 'paused',
              pending,
            },
          },
        );
        this.tokenInstance.status = 'paused';
      }
      else {
        // else if (anyOtherToken.pending.length === 0) {
        //   this.tokenInstance.status = 'paused';
        // }
        const updatedOtherToken = await this.persist.tokenInstance.update(
          {
            tokenId: anyOtherToken.tokenId,
          },
          {
            $pull: {
              pending: this.tokenInstance.lastActivity,
            },
          },
        );

        if (updatedOtherToken.pending.length > 0) {
          this.tokenInstance.status = 'paused';
        }
      }
    }
  };

  makeComplete = async () => {
    await this.triggerState('complete');
    const { outgoing } = this.definition;
    if (outgoing.length > 1) {
      this.tokenInstance.status = 'paused';

      const childs = await this.setupChilds(outgoing);

      await childs.forEach(async (child) => {
        await this.persist.tokenInstance.create(child.toJSON());
      });

      const funcs = childs.map(child => () => child.exec());

      return serial(funcs);
    }
  };
}

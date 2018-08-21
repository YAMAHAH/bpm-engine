import Gateway from 'lib/Elements/Gateway';
import serial from 'lib/serial';

export default class ParallelGateway extends Gateway {
  makeReady = async () => {
    await this.callPlugins('onReady');

    const { incoming } = this.definition;

    // converging
    if (incoming.length > 1) {
      // did any other waiting token arrive here yet?
      const anyOtherToken = await this.persist.tokenInstance.find({
        processId: this.tokenInstance.processId,
        status: 'paused',
        currentActivity: this.definition.id,
      });

      // no other active tokens have arrived here yet,
      // so use this token as the first which arrived
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

    return Promise.resolve();
  };

  makeComplete = async () => {
    await this.callPlugins('onComplete');

    const { outgoing } = this.definition;

    if (outgoing.length > 1) {
      this.tokenInstance.status = 'paused';

      const childs = await this.setupChilds(outgoing);

      const funcs = childs.map(child => async () =>
        new Promise((resolve) => {
          setTimeout(async () => {
            await this.persist.tokenInstance.create(child.toJSON());
            await child.execute();
            return resolve();
          }, 0);
        }));

      return serial(funcs);
    }

    return Promise.resolve();
  };
}

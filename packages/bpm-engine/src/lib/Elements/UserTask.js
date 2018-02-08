import Activity from 'lib/Elements/Activity';

export default class UserTask extends Activity {
  makeActive = async () => {
    await this.triggerState('active');
    this.tokenInstance.status = 'paused';
    await this.engine.persist.tokenInstance.update(
      { tokenId: this.tokenInstance.tokenId },
      { $set: this.tokenInstance.toJSON() },
      this.engine.store.tokenInstances,
    );
  };
}

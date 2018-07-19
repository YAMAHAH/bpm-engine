import Activity from 'lib/Elements/Activity';

export default class UserTask extends Activity {
  makeActive = async () => {
    await this.callPlugins('onActive');
    this.tokenInstance.status = 'paused';
    await this.engine.persist.tokenInstance.update(
      { tokenId: this.tokenInstance.tokenId },
      { $set: this.tokenInstance.toJSON() },
    );
  };
}

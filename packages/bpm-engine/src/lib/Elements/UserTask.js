import Activity from 'lib/Elements/Activity';

export default class UserTask extends Activity {
  makeActive = async () => {
    await this.callPlugins('onActive');
    this.tokenInstance.status = 'paused';
    await this.engine.persist.tokenInstance.update(
      { tokenId: this.tokenInstance.tokenId },
      { $set: this.tokenInstance.toJSON() },
    );

    await this.engine.persist.tasks.create({
      taskId: this.engine.generateId(),
      definition: JSON.stringify(this.definition),
      processId: this.tokenInstance.processId,
      tokenId: this.tokenInstance.tokenId,
      createdAt: new Date(),
      payload: this.tokenInstance.payload,
      status: 'created',
    });
  };
}

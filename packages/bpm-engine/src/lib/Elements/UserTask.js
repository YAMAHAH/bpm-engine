import Activity from 'lib/Elements/Activity';

export default class UserTask extends Activity {
  makeActive = async () => {
    this.tokenInstance.status = 'paused';
    await this.engine.persist.tokenInstance.update(
      { tokenId: this.tokenInstance.tokenId },
      { $set: this.tokenInstance.toJSON() },
    );

    const task = await this.engine.persist.tasks.create({
      taskId: this.engine.generateId(),
      definition: JSON.stringify(this.definition),
      processId: this.tokenInstance.processId,
      tokenId: this.tokenInstance.tokenId,
      createdAt: new Date(),
      payload: JSON.stringify(this.tokenInstance.payload),
    });

    await this.callPlugins('onActive', task);
  };
}

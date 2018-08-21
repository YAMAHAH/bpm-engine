import Activity from 'lib/Elements/Activity';

export default class UserTask extends Activity {
  makeActive = async () => {
    this.tokenInstance.status = 'paused';

    await this.tokenInstance.persistUpdate();

    const attrs = this.definition.$attrs;
    const def = this.definition;
    def.attrs = attrs;

    const task = await this.engine.persist.task.create({
      taskId: this.engine.generateId(),
      definition: JSON.stringify(def),
      processId: this.tokenInstance.processId,
      tokenId: this.tokenInstance.tokenId,
      createdAt: new Date(),
      payload: JSON.stringify(this.tokenInstance.payload),
    });

    await this.callPlugins('onActive', task);
  };
}

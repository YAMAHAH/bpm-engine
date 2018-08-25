import Activity from 'lib/Elements/Activity';

const scriptingEngines = ['JavaScript', 'NodeJS'];

export default class ScriptTask extends Activity {
  makeActive = async () => {
    await this.callPlugins('onActive');

    const { scriptFormat, script } = this.definition;

    if (scriptingEngines.includes(scriptFormat)) {
      // TODO: ...
      if (scriptFormat === 'JavaScript') {
        const fn = new Function('payload', script);
        fn(this.tokenInstance.payload);
      }

      // TODO: ...
      if (scriptFormat === 'NodeJS') {
        const fn = new Function('payload', script);
        fn(this.tokenInstance.payload);
      }
    }
    else {
      this.tokenInstance.status = 'paused';
      throw new Error(`Unsupported script format: ${scriptFormat}. Allowed script formats: ${scriptingEngines.join(', ')}`);
    }
  };
}

import debug from 'lib/debug';
import Plugins from 'lib/Plugins';

const { Element, UserTask, ServiceTask } = Plugins;

const log = debug('plugin');

const scopePlugins = (plugins) => {
  const scopedPlugins = {
    userTask: {},
    serviceTask: {},
    element: {},
  };

  Object.keys(plugins).forEach((key) => {
    if (plugins[key] instanceof Element) {
      scopedPlugins.element[key] = plugins[key];
    }
    if (plugins[key] instanceof UserTask) {
      scopedPlugins.userTask[key] = plugins[key];
    }
    if (plugins[key] instanceof ServiceTask) {
      scopedPlugins.serviceTask[key] = plugins[key];
    }
  });

  return scopedPlugins;
};

export default plugins =>
  scopePlugins(plugins.map((plugin) => {
    /* istanbul ignore next */
    if (typeof plugin === 'string') {
      log(`Plugin "${plugin}" will be required or searched on the global window`);
      const PluginConstructor =
          typeof window === 'undefined'
            ? require(`bpm-plugin-${plugin}`)
            : window.BPMEngine.Plugins[plugin];

      if (!PluginConstructor) {
        throw new Error(`Unable to load plugin "${plugin}"`);
      }

      log(`Instantiating plugin "${plugin}"`);
      return new PluginConstructor();
    }

    return plugin;
  }));

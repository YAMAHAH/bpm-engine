import MemoryPersist from '../dist/lib/defaults/MemoryPersist';

describe('MemoryPersist', () => {
  it('Throws when not provided with a valid store', () => {
    expect(() => new MemoryPersist({ store: {} })).toThrow();
    expect(() => new MemoryPersist({ store: { processInstances: [] } })).toThrow();
    expect(() => new MemoryPersist({ store: { processInstances: [], tokenInstances: [] } })).toThrow();
    expect(() =>
      new MemoryPersist({
        store: { processInstances: [], tokenInstances: [], workflowDefinitions: [] },
      })).toThrow();
    expect(() =>
      new MemoryPersist({
        store: {
          processInstances: [],
          tokenInstances: [],
          workflowDefinitions: [],
          timers: [],
        },
      })).toThrow();
  });
});

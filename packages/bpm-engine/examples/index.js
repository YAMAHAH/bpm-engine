const fs = require('fs');

const BPMEngine = require('./../');

const parallelWorkflowDefinition = fs.readFileSync(
  '../__tests__/diagrams/ParallelServices.bpmn',
  'utf-8',
);

class HistoryLogger extends BPMEngine.Plugins.Element {
  onReady(definition, tokenInstance) {
    console.log('ready', definition.id);
  }
  onActive(definition, tokenInstance) {
    console.log('active', definition.id);
  }
  onComplete(definition, tokenInstance) {
    console.log('complete', definition.id);
    console.log('');
  }
}

const historyLogger = new HistoryLogger();

const engine = new BPMEngine({
  enableClock: false,
  plugins: [historyLogger],
});

engine
  .createProcessInstance({
    workflowDefinition: parallelWorkflowDefinition,
  })
  .then(token => token.execute())
  .catch(err => console.error(err));

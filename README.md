# BPM Engine

[![Build Status](https://travis-ci.org/linus-amg/bpm-engine.svg?branch=master)](https://travis-ci.org/linus-amg/bpm-engine)
[![Test Coverage](https://api.codeclimate.com/v1/badges/59f4278e253d4c8c42c4/test_coverage)](https://codeclimate.com/github/componentDidMount/bpm-engine/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/59f4278e253d4c8c42c4/maintainability)](https://codeclimate.com/github/componentDidMount/bpm-engine/maintainability)

BPM Engine is a BPMN workflow execution engine written in JavaScript.

## Install and use

```sh
$ npm install bpm-engine --save
```

Use the BPM Engine with Node.JS or in your favourite Browser.

#### Start a processInstance

```js
const BPMEngine = require('bpm-engine');

// Instantiate an engine
const bpm = new BPMEngine();

// Create a new process instance, specify a valid bpmn definition (returns a token)
const token = await bpm
  .createProcessInstance({
    workflowDefinition: 'valid bpmn'
  })
  .catch(console.error);

// Tell the initial token to continue execution
await token.execute().catch(console.error);
```

#### Continue execution of a processInstance (by token)

```js
// At some later point in time, in a different part of
// your app (e.g. when a User task is handled as complete by your own app)
const token = await bpm.continueTokenInstance({
  tokenId: '<id of the token you want to execute>',
  // set the payload you want to merge into the existing payload
  payload: {}
});

await token.execute().catch(console.error);
```

## Currently supported flow objects

### Events:

- [x] Start
- [x] End
- [ ] IntermediateThrow
- [ ] MessageIntermediateThrow
- [ ] MessageIntermediateCatch
- [ ] MessageEnd
- [x] TimerIntermediateCatch
- [ ] EscalationIntermediateThrow
- [ ] EscalationEnd
- [ ] ErrorEnd
- [ ] ConditionalIntermediateThrow
- [ ] LinkIntermediateCatch
- [ ] LinkIntermediateThrow
- [ ] CompensationIntermediateThrow
- [ ] CompensationEnd
- [ ] SignalIntermediateThrow
- [ ] SignalIntermediateCatch
- [ ] MessageStart
- [x] TimerStart
- [ ] ConditionalStart
- [ ] SignalStart
- [ ] SignalEnd
- [ ] TerminateEnd

### Activities:

- [x] Task
- [x] Service
- [x] User
- [x] Manual
- [ ] Send
- [ ] Receive
- [ ] BusinessRule
- [x] Script

### Gateways:

- [x] Exclusive
- [x] Inclusive
- [x] Parallel
- [ ] EventBased
- [ ] Complex

### Other:

- [x] Swimlanes
- [ ] CallActivity
- [x] SubProcess
- [x] Loop
- [x] ParallelMultiInstance
- [ ] SequentialMultiInstance

## Persistency layer

You can install the following package to add a persistency layer to the state of your processes.

- bpm-engine-persist-mongoose

Use one of the persistency plugins in the BPM Engine:

```js
const BPMEngine = require('bpm-engine');
const PersistMongoose = require('bpm-engine-persist-mongoose');

const persistMongoose = new PersistMongoose(
  '<mongodb:url>',
  mongooseConnectionOptions
);

const engine = new BPMEngine({
  persist: persistMongoose
});
```

## Develop your own plugins

Currently you can develop plugins for the following elements:

- Element
- UserTask
- ServiceTask

You create plugins by extending from one of the above classes and instantiating a class into the plugins array when instantiating the engine.

```js
const BPMEngine = require('bpm-engine');

class History extends BPMEngine.Plugins.Element {
  constructor({ store = [] } = {}) {
    super();
    this.store = store;
  }

  onReady = definition => {
    this.store.push({ state: 'ready', elementId: definition.id });
  };
  onActive = definition => {
    this.store.push({ state: 'active', elementId: definition.id });
  };
  onComplete = definition => {
    this.store.push({ state: 'complete', elementId: definition.id });
  };
}

const history = new History();

const engine = new BPMEngine({ plugins: [history] });
```

The above plugin will push executed element's id's into an array, which serves as some kind of log.

#### Plugin methods

Every plugin can make use of three methods which will be called in order of execution,
_onReady_, _onActive_ and _onComplete_.

#### Method arguments

Methods receive the definition (as a moddle reference) of the current activity
and the processInstance (including its .payload) as arguments. Read more about
creating plugins here (... link missing...).

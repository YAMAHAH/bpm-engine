# bpm-engine-persist-mongoose

Persistency module to save all engine state in a MongoDB database.

## Installation

```sh
$ npm install bpm-engine-persist-mongoose --save
```

## Usage

Example of how to use PersistMongoose when instantiating a BPMEngine Instance.

```js
const BPMEngine = require('bpm-engine');
const PersistMongoose = require('bpm-engine-persist-mongoose');

const persistMongoose = new PersistMongoose(
  {
    host: '<server host>',
    port: '<server port number>'
  },
  {
    /* mongoose connection options */
  },
  {
    processInstance: 'PI',
    tokenInstance: 'TI'
  }
);

// Third argument is optional and can be used to define different collection names which
// you'd like BPMEngine to use, by default its always bpmengine_processinstances and bpmengine_tokeninstances.

const engine = new BPMEngine({
  persist: persistMongoose
});
```

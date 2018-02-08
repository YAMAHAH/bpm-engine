# bpm-engine-persist-mongoose

Persistency module to save all process and token instances state of the BPM Engine in a mongoose database.

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
    processInstance: 'PI',
    tokenInstance: 'TI'
  }
);

// The second argument is optional and can be used to define different key names which
// you'd like BPMEngine to use, by default its always processInstance.<processInstanceId> and tokenInstance.<processInstanceId>.<tokenInstanceId>, so the above example
// would change that to PI.<processInstanceId> and TI.<processInstanceId>.<tokenInstanceId>

const bpm = new BPMEngine({
  persist: persistMongoose
});
```

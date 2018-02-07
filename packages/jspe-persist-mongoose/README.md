# jspe-persist-mongoose

Persistency module to save all process and token instances state of JSPE in a mongoose database.

## Installation

```sh
$ npm install jspe-persist-mongoose --save
```

## Usage

Example of how to use PersistMongoose when instantiating a JSPE Instance.

```js
const JSPE = require('jspe');
const PersistRedis = require('jspe-persist-mongoose');

const persistRedis = new PersistRedis(
  {
    host: '<redis server host>',
    port: '<redis server port number>'
  },
  {
    processInstance: 'PI',
    tokenInstance: 'TI'
  }
);

// The second argument is optional and can be used to define different key names which
// you'd like JSPE to use, by default its always processInstance.<processInstanceId> and tokenInstance.<processInstanceId>.<tokenInstanceId>, so the above example
// would change that to PI.<processInstanceId> and TI.<processInstanceId>.<tokenInstanceId>

const jspe = new JSPE({
  persist: persistRedis
});

// At any time you have the original "node-redis" client available in the persistRedis instance at `persistRedis.client`.
```

Process and token instances executed by the engine using that persist method will now persist their state in the desired redis database.

### Looking for support of a different database?

* [jspe-persist-sequelize](/../packges/jspe-persist-sequelize) (MySQL, SQLite, PostgresSQL)
* [jspe-persist-mongoose](/../packages/jspe-persist-mongoose)

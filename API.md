Engine and Token Lifecycle

```js
import BPMEngine from 'bpm-engine';

// We should not care how and where bpmn/xml files are deployed or stored in your business.
// We do not support uploading bpmn/xml files.
// Thats why you will need to provide the xml whenever you want to create a new token.

// Instantiate a new engine with the default configuration, that means: no plugins, no persistency
const engine1 = new BPMEngine();

// Use the engine to create a token on a process xml,
// if no activityId is defined, the engine will search for a start event and if found
// use it as the current activity.
const token = await engine.createToken(bpmnXML);

// continue/start the execution of a token (automation starts now)
await token.continue({});

// at some later point in time you might wanna continue a token which has stopped for some reason (e.g. user task)
// so we enable you to find a token
const oldToken = await engine.getToken('token-id');

// you can then use the token to continue it
await oldToken.continue({});
```

Service Workers

```js
import BPMEngine from 'bpm-engine';

const engine1 = new BPMEngine();

// register a worker which polls the persistency layer for new service activities
// if you have no persistency, work cannot scale further then the node process which this engine
// runs on. (TODO: explain in more detail)
engine1.service(
  'payment-service',
  (payload, resolve, reject) => {
    // mutate the payload or create a new one
    const newPayload = {};

    // resolve a job (continue token)
    resolve(newPayload);

    // or reject a job
    reject();
  },
  {
    polling: {
      base: 1000, // first check after n MS
      increment: 1000, // everytime there is nothing to work on, increment by this amount of MS
      max: 60000 // increment up to this amount of MS
    }
  }
);

// check every 1000 ms if there is a new serviceTask to work on,
```

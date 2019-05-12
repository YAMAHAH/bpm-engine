import Event from 'lib/Elements/Event';
import makeInterval from 'iso8601-repeating-interval';
import * as constants from 'lib/constants';

const evaluateIntervalString = (body) => {
  const extendedBody = `R2/\${timestamp}/${body}`;

  const fnBody = `return \`${extendedBody}\`;`;
  const f = new Function('timestamp', fnBody);
  const intervalString = f(new Date().toISOString());
  return intervalString;
};

export default class IntermediateCatchEvent extends Event {
  makeActive = async () => {
    await this.callPlugins('onActive');
    this.tokenInstance.status = 'paused';

    await this.tokenInstance.persistUpdate();

    // create the timer event so the process continues at some point
    const { eventDefinitions } = this.definition;
    const firstEventDefinition = eventDefinitions[0];

    if (firstEventDefinition) {
      const { timeDuration } = firstEventDefinition;

      if (timeDuration) {
        const intervalString = evaluateIntervalString(timeDuration.body);
        const interval = makeInterval(intervalString);
        const firstAfter = interval.firstAfter(new Date() - 1000);

        if (firstAfter && firstAfter.index === 0) {
          const secondAfter = interval.firstAfter(firstAfter.time + 500);

          await this.persist.timers.create({
            timerId: this.engine.generateId(),
            index: secondAfter.index,
            time: secondAfter.date / 1,
            interval: intervalString,
            intent: constants.CONTINUE_TOKEN_INSTANCE_INTENT,
            tokenId: this.tokenInstance.tokenId,
          });
        }
      }
    }
  };
}

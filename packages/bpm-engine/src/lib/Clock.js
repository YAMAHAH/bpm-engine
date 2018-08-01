const DEFAULTS = {
  onTick: () => {},
  interval: 1000,
};

export default class Clock {
  status = 'paused';

  constructor({ onTick = DEFAULTS.ONTICK, interval = DEFAULTS.INTERVAL }) {
    this.onTick = onTick;
    this.interval = interval;
    this.tick();
  }

  tick() {
    setTimeout(async () => {
      await this.onTick();
      this.tick();
    }, this.interval);
  }
}

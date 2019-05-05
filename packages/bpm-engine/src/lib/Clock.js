const DEFAULTS = {
  onTick: () => {},
  interval: 1000,
};

class Clock {
  constructor({ onTick = DEFAULTS.ONTICK, interval = DEFAULTS.INTERVAL }) {
    this.onTick = onTick;
    this.interval = interval;
    this.tick();
  }

  tick() {
    this.timeout = setTimeout(async () => {
      await this.onTick();
      this.tick();
    }, this.interval);
  }

  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}

export default 
/*
 * Functions that emulate BlitzBasic behaviour
 */

class Blitz3DRandom {
  seed;

  /**
   * @param {number} seed
   */
  constructor(seed) {
    this.seed = seed & 0x7fffffff;
  }

  /**
   * @returns {number}
   */
  #_rnd() {
    const RND_A = 48271,
      RND_M = 2147483647,
      RND_Q = 44488,
      RND_R = 3399;

    this.seed =
      RND_A * (this.seed % RND_Q) - RND_R * Math.floor(this.seed / RND_Q);
    if (this.seed < 0) this.seed += RND_M;
    return (this.seed & 65535) / 65536.0 + 0.5 / 65536.0;
  }

  /**
   * Directly translated from disassembly of
   * `SCP - Containment Breach.exe`
   * at offset `0x1003bbe0`
   *
   * @param {number} start
   * @param {number} end (Optional)
   * @returns {number}
   */
  rnd(start, end = 0) {
    this.seed = Math.trunc(
      (this.seed % 0xadc8) * 0xbc8f + Math.trunc(this.seed / 0xadc8) * -0xd47
    );

    if (this.seed < 0) {
      this.seed += 0x7fffffff;
    }

    return (
      (end - start) * ((this.seed & 0xffff) * 1.525879e-5 + 7.629395e-6) + start
    );
  }

  /**
   * Directly translated from disassembly of
   * `SCP - Containment Breach.exe`
   * at offset `0x1003bc70`
   *
   * @param {number} start
   * @param {number} end
   * @returns {number}
   */
  rand(start, end = 1) {
    if (end < start) {
      let t = start;
      start = end;
      end = t;
    }

    this.seed = Math.trunc(
      (this.seed % 0xadc8) * 0xbc8f + Math.trunc(this.seed / 0xadc8) * -0xd47
    );

    if (this.seed < 0) {
      this.seed += 0x7fffffff;
    }

    let f_reg = this.seed & 0xffff;

    f_reg *= 1.525879e-5;
    f_reg += 7.629395e-6;
    f_reg *= end - start + 1;

    return Math.trunc(f_reg) + start;

    //return Math.floor(this.#_rnd() * (end - start + 1)) + start;
  }
}

var ROOMS = [];

class Rooms {
  zone;
  shape;
  x;
  y;
  z;
  template;
  angle;
  adjacent;
  items;

  /**
   * @param {number} zone
   * @param {number} shape
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  constructor(zone, shape, x, y, z) {
    this.zone = zone;
    this.shape = shape;
    this.x = x;
    this.y = y;
    this.z = z;
    this.template = "";
    this.angle = 0;
    this.adjacent = [null, null, null, null];
    this.items = [];

    ROOMS.push(this);
  }
}

class I_Zone {
  transition;
  has_custom_forest;
  has_custom_mt;

  constructor(transition, has_custom_forest, has_custom_mt) {
    this.transition = transition;
    this.has_custom_forest = has_custom_forest;
    this.has_custom_mt = has_custom_mt;
  }
}

/**
 *
 * @param {string} seed
 * @returns {number}
 */
function generateSeedNumber(seed) {
  let temp = 0,
    shift = 0;

  for (let i = 0; i < seed.length; i++) {
    temp ^= seed.charCodeAt(i) << shift;
    shift = (shift + 1) % 24;
  }

  return temp;
}

export { Blitz3DRandom, ROOMS, Rooms, I_Zone, generateSeedNumber };

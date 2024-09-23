import {
  ROOM_TEMPLATES,
  ROOM_SCALE,
  ZONEAMOUNT,
  MAP_WIDTH,
  MAP_HEIGHT,
  ROOM1,
  ROOM2,
  ROOM2C,
  ROOM3,
  ROOM4,
} from "./constants.js";
import {
  Blitz3DRandom,
  ROOMS,
  Rooms,
  I_Zone,
  generateSeedNumber,
} from "./blitzbasic.js";

import { str_to_shape, make_map, make_list, wrap_angle } from "./utils.js";

class MapGen {
  rng;
  MAP_NAME;
  MAP_TEMP;
  MAP_ROOM_ID;
  MAP_ROOM;

  /**
   * @param {string} seed_name
   */
  constructor(seed_name) {
    while (ROOMS.length > 0) ROOMS.pop();

    let seed = generateSeedNumber(seed_name);
    this.rng = new Blitz3DRandom(seed);

    this.MAP_NAME = make_map(MAP_WIDTH, MAP_HEIGHT, "");
    this.MAP_TEMP = make_map(MAP_WIDTH + 1, MAP_HEIGHT + 1, 0);

    this.MAP_ROOM_ID = make_list(ROOM4 + 1, 0);
    this.MAP_ROOM = [make_list(ROOM4 + 1, "")];
  }

  /**
   * @param {number} y
   * @returns {number}
   */
  #_get_zone(y) {
    return Math.min(
      Math.floor((Math.floor(MAP_WIDTH - y) / MAP_WIDTH) * ZONEAMOUNT),
      ZONEAMOUNT - 1
    );
  }

  /**
   * ORIG COMMENT ;place a room without overwriting others
   * @param {string} room_name
   * @param {number} room_type
   * @param {number} pos
   * @param {number} min_pos
   * @param {number} max_pos
   * @returns {boolean}
   */
  #_set_room(room_name, room_type, pos, min_pos, max_pos) {
    if (max_pos < min_pos) {
      console.warn(`Can't place ${room_name.toUpperCase()}`);
      return false;
    }

    console.debug(`--- SETROOM: ${room_name.toUpperCase()} ---`);
    let looped = false,
      can_place = true;
    while (this.MAP_ROOM[room_type][pos] !== "") {
      console.debug(`found ${this.MAP_ROOM[room_type][pos]}`);
      pos += 1;
      if (pos > max_pos) {
        if (!looped) {
          pos = min_pos + 1;
          looped = true;
        } else {
          can_place = false;
          break;
        }
      }
    }

    console.debug(`${room_name} ${pos}`);
    if (can_place) {
      console.debug("--------------");
      this.MAP_ROOM[room_type][pos] = room_name;
      return true;
    } else {
      console.debug(`couldn't place ${room_name}`);
      return false;
    }
  }

  /**
   * @param {number} zone
   * @param {number} roomshape
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {string} name (Optional)
   * @returns
   */
  #_create_room(zone, roomshape, x, y, z, name = "") {
    let r = new Rooms(zone, roomshape, x, y, z);

    if (name !== "") {
      name = name.toLowerCase();
      for (let rt of Object.keys(ROOM_TEMPLATES.data)) {
        if (rt === name) {
          r.template = rt;

          // TODO FillRoom(r)

          return r;
        }
      }
    }

    let temp = 0;
    for (let name of Object.keys(ROOM_TEMPLATES.data)) {
      let rt = ROOM_TEMPLATES.data[name];
      for (let i = 0; i <= 4; i++) {
        if (parseInt(rt[`zone${i}`] ?? "0") === zone) {
          if (str_to_shape(rt["shape"] ?? "0") === roomshape) {
            temp = temp + parseInt(rt["commonness"] ?? "0");
            break;
          }
        }
      }
    }

    let random_room = this.rng.rand(temp);
    temp = 0;
    for (let name of Object.keys(ROOM_TEMPLATES.data)) {
      let rt = ROOM_TEMPLATES.data[name];
      for (let i = 0; i <= 4; i++) {
        let commonness = parseInt(rt["commonness"] ?? "0");
        if (
          parseInt(rt[`zone${i}`] ?? "0") === zone &&
          str_to_shape(rt["shape"] ?? "0") === roomshape
        ) {
          temp += commonness;
          if (random_room > temp - commonness && random_room <= temp) {
            r.template = name;

            // TODO FillRoom(r)

            return r;
          }
        }
      }
    }
  }

  /**
   * Function directly translated from [Regalis11/scpcb](https://github.com/Regalis11/scpcb/blob/master/MapSystem.bb#L7023)
   *
   *
   * Dont blame me for the structure of this function,
   * just look at the original source code
   */
  create_map() {
    let i_zone = new I_Zone([13, 7], 0, 0),
      x = Math.floor(MAP_WIDTH / 2),
      y = MAP_HEIGHT - 2,
      temp = 0;

    for (let i = y; i <= MAP_HEIGHT - 1; i++) {
      this.MAP_TEMP[x][i] = 1;
    }

    while (y >= 2) {
      let width = this.rng.rand(10, 15);

      if (x > MAP_WIDTH * 0.6) {
        width = -width;
      } else if (x > MAP_WIDTH * 0.4) {
        x = x - Math.trunc(width / 2);
      }

      // ORTIG COMMENT ;make sure the hallway doesn't go outside the array
      if (x + width > MAP_WIDTH - 3) {
        width = MAP_WIDTH - 3 - x;
      } else if (x + width < 2) {
        width = -x + 2;
      }

      x = Math.min(x, x + width);
      width = Math.abs(width);
      for (let i = x; i <= x + width; i++) {
        this.MAP_TEMP[Math.min(i, MAP_WIDTH)][y] = 1;
      }

      let height = this.rng.rand(3, 4);
      if (y - height < 1) {
        height = y - 1;
      }

      let yhallways = this.rng.rand(4, 5);

      if (this.#_get_zone(y - height) !== this.#_get_zone(y - height + 1)) {
        height = height - 1;
      }

      for (let i = 1; i <= yhallways; i++) {
        let x2 = Math.max(
          Math.min(this.rng.rand(x, x + width - 1), MAP_WIDTH - 2),
          2
        );
        while (
          this.MAP_TEMP[x2][y - 1] ||
          this.MAP_TEMP[x2 - 1][y - 1] ||
          this.MAP_TEMP[x2 + 1][y - 1]
        ) {
          x2 += 1;
        }
        let tempheight = 0;
        if (x2 < x + width) {
          if (i === 1) {
            tempheight = height;
            if (this.rng.rand(2) === 1) {
              x2 = x;
            } else {
              x2 = x + width;
            }
          } else {
            tempheight = this.rng.rand(height);
          }

          for (let y2 = y - tempheight; y2 <= y; y2++) {
            if (this.#_get_zone(y2) !== this.#_get_zone(y2 + 1)) {
              // ORIG COMMENT ;a room leading from zone to another
              this.MAP_TEMP[x2][y2] = 255;
            } else {
              this.MAP_TEMP[x2][y2] = 1;
            }
          }

          if (tempheight === height) {
            temp = x2;
          }
        }
      }

      x = temp;
      y -= height;
    }

    let room1_amount = [0, 0, 0],
      room2_amount = [0, 0, 0],
      room2c_amount = [0, 0, 0],
      room3_amount = [0, 0, 0],
      room4_amount = [0, 0, 0];

    // ORIG COMMENT ;count the amount of rooms
    for (let y = 1; y <= MAP_HEIGHT - 1; y++) {
      let zone = this.#_get_zone(y);

      for (let x = 1; x <= MAP_WIDTH - 1; x++) {
        if (this.MAP_TEMP[x][y] > 0) {
          temp =
            Math.min(this.MAP_TEMP[x + 1][y], 1) +
            Math.min(this.MAP_TEMP[x - 1][y], 1);
          temp +=
            Math.min(this.MAP_TEMP[x][y + 1], 1) +
            Math.min(this.MAP_TEMP[x][y - 1], 1);
          if (this.MAP_TEMP[x][y] < 255) {
            this.MAP_TEMP[x][y] = temp;
          }
          switch (this.MAP_TEMP[x][y]) {
            case ROOM1:
              room1_amount[zone]++;
              break;
            case ROOM2:
              if (
                Math.min(this.MAP_TEMP[x + 1][y], 1) +
                  Math.min(this.MAP_TEMP[x - 1][y], 1) ===
                2
              ) {
                room2_amount[zone]++;
              } else if (
                Math.min(this.MAP_TEMP[x][y + 1], 1) +
                  Math.min(this.MAP_TEMP[x][y - 1], 1) ===
                2
              ) {
                room2_amount[zone]++;
              } else {
                room2c_amount[zone]++;
              }
              break;
            case ROOM2C:
              room3_amount[zone]++;
              break;
            case 4:
              room4_amount[zone]++;
              break;
          }
        }
      }
    }

    // ORIG COMMENT ;force more room1s (if needed)
    for (let i = 0; i <= 2; i++) {
      // ORIG COMMENT ;need more rooms if there are less than 5 of them
      let temp = -room1_amount[i] + 5,
        x2 = 0,
        y2 = 0;

      if (temp > 0) {
        for (
          let y = (MAP_HEIGHT / ZONEAMOUNT) * (2 - i) + 1;
          y <= (MAP_HEIGHT / ZONEAMOUNT) * (2 - i + 1.0) - 2;
          y++
        ) {
          for (let x = 2; x <= MAP_WIDTH - 2; x++) {
            if (this.MAP_TEMP[x][y] === 0) {
              if (
                Math.min(this.MAP_TEMP[x + 1][y], 1) +
                  Math.min(this.MAP_TEMP[x - 1][y], 1) +
                  Math.min(this.MAP_TEMP[x][y + 1], 1) +
                  Math.min(this.MAP_TEMP[x][y - 1], 1) ===
                1
              ) {
                if (this.MAP_TEMP[x + 1][y]) {
                  x2 = x + 1;
                  y2 = y;
                } else if (this.MAP_TEMP[x - 1][y]) {
                  x2 = x - 1;
                  y2 = y;
                } else if (this.MAP_TEMP[x][y + 1]) {
                  x2 = x;
                  y2 = y + 1;
                } else if (this.MAP_TEMP[x][y - 1]) {
                  x2 = x;
                  y2 = y - 1;
                }

                let placed = false;
                if (this.MAP_TEMP[x2][y2] > 1 && this.MAP_TEMP[x2][y2] < 4) {
                  switch (this.MAP_TEMP[x2][y2]) {
                    case 2:
                      if (
                        Math.min(this.MAP_TEMP[x2 + 1][y2], 1) +
                          Math.min(this.MAP_TEMP[x2 - 1][y2], 1) ===
                        2
                      ) {
                        room2_amount[i]--;
                        room3_amount[i]++;
                        placed = true;
                      } else if (
                        Math.min(this.MAP_TEMP[x2][y2 + 1], 1) +
                          Math.min(this.MAP_TEMP[x2][y2 - 1], 1) ===
                        2
                      ) {
                        room2_amount[i]--;
                        room3_amount[i]++;
                        placed = true;
                      }
                      break;
                    case 3:
                      room3_amount[i]--;
                      room4_amount[i]++;
                      placed = true;
                      break;
                  }

                  if (placed) {
                    this.MAP_TEMP[x2][y2]++;

                    this.MAP_TEMP[x][y] = 1;
                    room1_amount[i]++;

                    temp--;
                  }
                }
              }
            }
            if (temp === 0) {
              break;
            }
          }
          if (temp === 0) {
            break;
          }
        }
      }
    }

    // ORIG COMMENT ;force more room4s and room2Cs
    let zone = 0,
      temp2 = 0;
    for (let i = 0; i <= 2; i++) {
      switch (i) {
        case 2:
          zone = 2;
          temp2 = MAP_HEIGHT / 3;
          break;
        case 1:
          zone = MAP_HEIGHT / 3 + 1;
          temp2 = MAP_HEIGHT * (2.0 / 3.0) - 1;
          break;
        case 0:
          zone = MAP_HEIGHT * (2.0 / 3.0) + 1;
          temp2 = MAP_HEIGHT - 2;
          break;
      }

      if (room4_amount[i] < 1) {
        // ORIG COMMENT ;we want at least 1 ROOM4
        console.debug(`forcing a ROOM4 into zone ${i}`);
        temp = 0;

        for (let y = zone; y <= temp2; y++) {
          for (let x = 2; x <= MAP_WIDTH - 2; x++) {
            if (this.MAP_TEMP[x][y] === 3) {
              // ORIG COMMENT ;see if adding a ROOM1 is possible
              // `Select 0` of original code
              if (
                (this.MAP_TEMP[x + 1][y] ||
                  this.MAP_TEMP[x + 1][y + 1] ||
                  this.MAP_TEMP[x + 1][y - 1] ||
                  this.MAP_TEMP[x + 2][y]) === 0
              ) {
                this.MAP_TEMP[x + 1][y] = 1;
                temp = 1;
              } else if (
                (this.MAP_TEMP[x - 1][y] ||
                  this.MAP_TEMP[x - 1][y + 1] ||
                  this.MAP_TEMP[x - 1][y - 1] ||
                  this.MAP_TEMP[x - 2][y]) === 0
              ) {
                this.MAP_TEMP[x - 1][y] = 1;
                temp = 1;
              } else if (
                (this.MAP_TEMP[x][y + 1] ||
                  this.MAP_TEMP[x + 1][y + 1] ||
                  this.MAP_TEMP[x - 1][y + 1] ||
                  this.MAP_TEMP[x][y + 2]) === 0
              ) {
                this.MAP_TEMP[x][y + 1] = 1;
                temp = 1;
              } else if (
                (this.MAP_TEMP[x][y - 1] ||
                  this.MAP_TEMP[x + 1][y - 1] ||
                  this.MAP_TEMP[x - 1][y - 1] ||
                  this.MAP_TEMP[x][y - 2]) === 0
              ) {
                this.MAP_TEMP[x][y - 1] = 1;
                temp = 1;
              }

              if (temp === 1) {
                this.MAP_TEMP[x][y] = 4; // ORIG COMMENT ;turn this room into a ROOM4
                console.debug(`ROOM4 forced into slot (${x}, ${y})`);

                room4_amount[i]++;
                room3_amount[i]--;
                room1_amount[i]++;
              }
            }

            if (temp === 1) {
              break;
            }
          }

          if (temp === 1) {
            break;
          }
        }

        if (temp === 0) {
          console.debug(`Couldn't place ROOM4 of zone ${i}`);
        }
      }

      if (room2c_amount[i] < 1) {
        // ORIG COMMENT ;we want at least 1 ROOM2C
        console.debug(`forcing a ROOM2C into zone ${i}`);
        temp = 0;

        zone++;
        temp2--;

        for (let y = zone; y <= temp2; y++) {
          for (let x = 3; x <= MAP_WIDTH - 3; x++) {
            if (this.MAP_TEMP[x][y] === 1) {
              // `Select true` ORIG COMMENT ;see if adding some rooms is possible
              if (this.MAP_TEMP[x - 1][y] > 0) {
                if (
                  this.MAP_TEMP[x][y - 1] +
                    this.MAP_TEMP[x][y + 1] +
                    this.MAP_TEMP[x + 2][y] ===
                  0
                ) {
                  if (
                    this.MAP_TEMP[x + 1][y - 2] +
                      this.MAP_TEMP[x + 2][y - 1] +
                      this.MAP_TEMP[x + 1][y - 1] ===
                    0
                  ) {
                    this.MAP_TEMP[x][y] = 2;
                    this.MAP_TEMP[x + 1][y] = 2;
                    console.debug(`ROOM2C forced into slot (${x + 1}, ${y})`);
                    this.MAP_TEMP[x + 1][y - 1] = 1;
                    temp = 1;
                  } else if (
                    this.MAP_TEMP[x + 1][y + 2] +
                      this.MAP_TEMP[x + 2][y + 1] +
                      this.MAP_TEMP[x + 1][y + 1] ===
                    0
                  ) {
                    this.MAP_TEMP[x][y] = 2;
                    this.MAP_TEMP[x + 1][y] = 2;
                    console.debug(`ROOM2C forced into slot (${x + 1}, ${y})`);
                    this.MAP_TEMP[x + 1][y + 1] = 1;
                    temp = 1;
                  }
                }
              } else if (this.MAP_TEMP[x + 1][y] > 0) {
                if (
                  this.MAP_TEMP[x][y - 1] +
                    this.MAP_TEMP[x][y + 1] +
                    this.MAP_TEMP[x - 2][y] ===
                  0
                ) {
                  if (
                    this.MAP_TEMP[x - 1][y - 2] +
                      this.MAP_TEMP[x - 2][y - 1] +
                      this.MAP_TEMP[x - 1][y - 1] ===
                    0
                  ) {
                    this.MAP_TEMP[x][y] = 2;
                    this.MAP_TEMP[x - 1][y] = 2;
                    console.debug(`ROOM2C forced into slot (${x - 1}, ${y})`);
                    this.MAP_TEMP[x - 1][y - 1] = 1;
                    temp = 1;
                  } else if (
                    this.MAP_TEMP[x - 1][y + 2] +
                      this.MAP_TEMP[x - 2][y + 1] +
                      this.MAP_TEMP[x - 1][y + 1] ===
                    0
                  ) {
                    this.MAP_TEMP[x][y] = 2;
                    this.MAP_TEMP[x - 1][y] = 2;
                    console.debug(`ROOM2C forced into slot (${x - 1}, ${y})`);
                    this.MAP_TEMP[x - 1][y + 1] = 1;
                    temp = 1;
                  }
                }
              } else if (this.MAP_TEMP[x][y - 1] > 0) {
                if (
                  this.MAP_TEMP[x - 1][y] +
                    this.MAP_TEMP[x + 1][y] +
                    this.MAP_TEMP[x][y + 2] ===
                  0
                ) {
                  if (
                    this.MAP_TEMP[x - 2][y + 1] +
                      this.MAP_TEMP[x - 1][y + 2] +
                      this.MAP_TEMP[x - 1][y + 1] ===
                    0
                  ) {
                    this.MAP_TEMP[x][y] = 2;
                    this.MAP_TEMP[x][y + 1] = 2;
                    console.debug(`ROOM2C forced into slot (${x}, ${y + 1})`);
                    this.MAP_TEMP[x - 1][y + 1] = 1;
                    temp = 1;
                  } else if (
                    this.MAP_TEMP[x + 2][y + 1] +
                      this.MAP_TEMP[x + 1][y + 2] +
                      this.MAP_TEMP[x + 1][y + 1] ===
                    0
                  ) {
                    this.MAP_TEMP[x][y] = 2;
                    this.MAP_TEMP[x][y + 1] = 2;
                    console.debug(`ROOM2C forced into slot (${x}, ${y + 1})`);
                    this.MAP_TEMP[x + 1][y + 1] = 1;
                    temp = 1;
                  }
                }
              } else if (this.MAP_TEMP[x][y + 1] > 0) {
                if (
                  this.MAP_TEMP[x - 1][y] +
                    this.MAP_TEMP[x + 1][y] +
                    this.MAP_TEMP[x][y - 2] ===
                  0
                ) {
                  if (
                    this.MAP_TEMP[x - 2][y - 1] +
                      this.MAP_TEMP[x - 1][y - 2] +
                      this.MAP_TEMP[x - 1][y - 1] ===
                    0
                  ) {
                    this.MAP_TEMP[x][y] = 2;
                    this.MAP_TEMP[x][y - 1] = 2;
                    console.debug(`ROOM2C forced into slot (${x}, ${y - 1}`);
                    this.MAP_TEMP[x - 1][y - 1] = 1;
                    temp = 1;
                  } else if (
                    this.MAP_TEMP[x + 2][y - 1] +
                      this.MAP_TEMP[x + 1][y - 2] +
                      this.MAP_TEMP[x + 1][y - 1] ===
                    0
                  ) {
                    this.MAP_TEMP[x][y] = 2;
                    this.MAP_TEMP[x][y - 1] = 2;
                    console.debug(`ROOM2C forced into slot (${x}, ${y - 1})`);
                    this.MAP_TEMP[x + 1][y - 1] = 1;
                    temp = 1;
                  }
                }
              }

              if (temp === 1) {
                room2c_amount[i]++;
                room2_amount[i]++;
              }
            }

            if (temp === 1) {
              break;
            }
          }

          if (temp === 1) {
            break;
          }
        }

        if (temp === 0) {
          console.debug(`Couldn't place ROOM2C of zone ${i}`);
        }
      }
    }

    let max_rooms = 55 * MAP_WIDTH;
    max_rooms = Math.max(
      max_rooms,
      room1_amount[0] + room1_amount[1] + room1_amount[2] + 1
    );
    max_rooms = Math.max(
      max_rooms,
      room2_amount[0] + room2_amount[1] + room2_amount[2] + 1
    );
    max_rooms = Math.max(
      max_rooms,
      room2c_amount[0] + room2c_amount[1] + room2c_amount[2] + 1
    );
    max_rooms = Math.max(
      max_rooms,
      room3_amount[0] + room3_amount[1] + room3_amount[2] + 1
    );
    max_rooms = Math.max(
      max_rooms,
      room4_amount[0] + room4_amount[1] + room4_amount[2] + 1
    );

    this.MAP_ROOM = make_map(ROOM4 + 1, max_rooms, "");

    // ORIG COMMENT ;zone 1 --------------------------------------------------------------------------------------------------

    let min_pos = 1,
      max_pos = room1_amount[0] - 1;

    this.MAP_ROOM[ROOM1][0] = "start";
    this.#_set_room(
      "roompj",
      ROOM1,
      Math.floor(0.1 * room1_amount[0]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "914",
      ROOM1,
      Math.floor(0.3 * room1_amount[0]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room1archive",
      ROOM1,
      Math.floor(0.5 * room1_amount[0]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room205",
      ROOM1,
      Math.floor(0.6 * room1_amount[0]),
      min_pos,
      max_pos
    );

    this.MAP_ROOM[ROOM2C][0] = "lockroom";

    max_pos = room2_amount[0] - 1;

    this.MAP_ROOM[ROOM2][0] = "room2closets";
    this.#_set_room(
      "room2testroom2",
      ROOM2,
      Math.floor(0.1 * room2_amount[0]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2scps",
      ROOM2,
      Math.floor(0.2 * room2_amount[0]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2storage",
      ROOM2,
      Math.floor(0.3 * room2_amount[0]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2gw_b",
      ROOM2,
      Math.floor(0.4 * room2_amount[0]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2sl",
      ROOM2,
      Math.floor(0.5 * room2_amount[0]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room012",
      ROOM2,
      Math.floor(0.55 * room2_amount[0]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2scps2",
      ROOM2,
      Math.floor(0.6 * room2_amount[0]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room1123",
      ROOM2,
      Math.floor(0.7 * room2_amount[0]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2elevator",
      ROOM2,
      Math.floor(0.85 * room2_amount[0]),
      min_pos,
      max_pos
    );

    this.MAP_ROOM[ROOM3][Math.floor(this.rng.rnd(0.2, 0.8) * room3_amount[0])] =
      "room3storage";
    this.MAP_ROOM[ROOM2C][Math.floor(0.5 * room2c_amount[0])] = "room1162";
    this.MAP_ROOM[ROOM4][Math.floor(0.3 * room4_amount[0])] = "room4info";

    // ORIG COMMENT ;zone 2 --------------------------------------------------------------------------------------------------

    min_pos = room1_amount[0];
    max_pos = room1_amount[0] + room1_amount[1] - 1;

    this.#_set_room(
      "room079",
      ROOM1,
      room1_amount[0] + Math.floor(0.15 * room1_amount[1]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room106",
      ROOM1,
      room1_amount[0] + Math.floor(0.3 * room1_amount[1]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "008",
      ROOM1,
      room1_amount[0] + Math.floor(0.4 * room1_amount[1]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room035",
      ROOM1,
      room1_amount[0] + Math.floor(0.5 * room1_amount[1]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "coffin",
      ROOM1,
      room1_amount[0] + Math.floor(0.7 * room1_amount[1]),
      min_pos,
      max_pos
    );

    min_pos = room2_amount[0];
    max_pos = room2_amount[0] + room2_amount[1] - 1;

    this.MAP_ROOM[ROOM2][room2_amount[0] + Math.floor(0.1 * room2_amount[1])] =
      "room2nuke";
    this.#_set_room(
      "room2tunnel",
      ROOM2,
      room2_amount[0] + Math.floor(0.25 * room2_amount[1]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room049",
      ROOM2,
      room2_amount[0] + Math.floor(0.4 * room2_amount[1]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2shaft",
      ROOM2,
      room2_amount[0] + Math.floor(0.6 * room2_amount[1]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "testroom",
      ROOM2,
      room2_amount[0] + Math.floor(0.7 * room2_amount[1]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2servers",
      ROOM2,
      room2_amount[0] + Math.floor(0.9 * room2_amount[1]),
      min_pos,
      max_pos
    );

    this.MAP_ROOM[ROOM3][room3_amount[0] + Math.floor(0.3 * room3_amount[1])] =
      "room513";
    this.MAP_ROOM[ROOM3][room3_amount[0] + Math.floor(0.6 * room3_amount[1])] =
      "room966";

    this.MAP_ROOM[ROOM2C][
      room2c_amount[0] + Math.floor(0.5 * room2c_amount[1])
    ] = "room2cpit";

    // ORIG COMMENT ;zone 3  --------------------------------------------------------------------------------------------------

    this.MAP_ROOM[ROOM1][
      room1_amount[0] + room1_amount[1] + room1_amount[2] - 2
    ] = "exit1";
    this.MAP_ROOM[ROOM1][
      room1_amount[0] + room1_amount[1] + room1_amount[2] - 1
    ] = "gateaentrance";
    this.MAP_ROOM[ROOM1][room1_amount[0] + room1_amount[1]] = "room1lifts";

    min_pos = room2_amount[0] + room2_amount[1];
    max_pos = room2_amount[0] + room2_amount[1] + room2_amount[2] - 1;

    this.MAP_ROOM[ROOM2][min_pos + Math.floor(0.1 * room2_amount[2])] =
      "room2poffices";
    this.#_set_room(
      "room2cafeteria",
      ROOM2,
      min_pos + Math.floor(0.2 * room2_amount[2]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2sroom",
      ROOM2,
      min_pos + Math.floor(0.3 * room2_amount[2]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2servers2",
      ROOM2,
      min_pos + Math.floor(0.4 * room2_amount[2]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2offices",
      ROOM2,
      min_pos + Math.floor(0.45 * room2_amount[2]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2offices4",
      ROOM2,
      min_pos + Math.floor(0.5 * room2_amount[2]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room860",
      ROOM2,
      min_pos + Math.floor(0.6 * room2_amount[2]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "medibay",
      ROOM2,
      min_pos + Math.floor(0.7 * room2_amount[2]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2poffices2",
      ROOM2,
      min_pos + Math.floor(0.8 * room2_amount[2]),
      min_pos,
      max_pos
    );
    this.#_set_room(
      "room2offices2",
      ROOM2,
      min_pos + Math.floor(0.9 * room2_amount[2]),
      min_pos,
      max_pos
    );

    this.MAP_ROOM[ROOM2C][room2c_amount[0] + room2c_amount[1]] = "room2ccont";
    this.MAP_ROOM[ROOM2C][room2c_amount[0] + room2c_amount[1] + 1] =
      "lockroom2";

    this.MAP_ROOM[ROOM3][
      room3_amount[0] + room3_amount[1] + Math.floor(0.3 * room3_amount[2])
    ] = "room3servers";
    this.MAP_ROOM[ROOM3][
      room3_amount[0] + room3_amount[1] + Math.floor(0.7 * room3_amount[2])
    ] = "room3servers2";
    this.MAP_ROOM[ROOM3][
      room3_amount[0] + room3_amount[1] + Math.floor(0.5 * room3_amount[2])
    ] = "room3offices";

    // TRANSLATED COMMENT ;----------------------- creating map --------------------------------

    temp = 0;
    let spacing = 8.0,
      r = null;

    for (let y = MAP_HEIGHT - 1; y >= 1; y--) {
      if (y < MAP_HEIGHT / 3 + 1) {
        zone = 3;
      } else if (y < MAP_HEIGHT * (2.0 / 3.0)) {
        zone = 2;
      } else {
        zone = 1;
      }

      for (let x = 1; x <= MAP_WIDTH - 2; x++) {
        if (this.MAP_TEMP[x][y] === 255) {
          if (y > MAP_HEIGHT / 2) {
            r = this.#_create_room(zone, ROOM2, x * 8, 0, y * 8, "checkpoint1");
          } else {
            r = this.#_create_room(zone, ROOM2, x * 8, 0, y * 8, "checkpoint2");
          }
        } else if (this.MAP_TEMP[x][y] > 0) {
          let temp =
            Math.min(this.MAP_TEMP[x + 1][y], 1) +
            Math.min(this.MAP_TEMP[x - 1][y], 1) +
            Math.min(this.MAP_TEMP[x][y + 1], 1) +
            Math.min(this.MAP_TEMP[x][y - 1], 1);

          switch (
            temp // TRANSLATED COMMENT ;rooms of adjacent squares
          ) {
            case 1:
              if (
                this.MAP_ROOM_ID[ROOM1] < max_rooms &&
                this.MAP_NAME[x][y] === ""
              ) {
                if (this.MAP_ROOM[ROOM1][this.MAP_ROOM_ID[ROOM1]] !== "") {
                  this.MAP_NAME[x][y] =
                    this.MAP_ROOM[ROOM1][this.MAP_ROOM_ID[ROOM1]];
                }
              }

              r = this.#_create_room(
                zone,
                ROOM1,
                x * 8,
                0,
                y * 8,
                this.MAP_NAME[x][y]
              );
              if (this.MAP_TEMP[x][y + 1] !== 0) {
                r.angle = 180;
              } else if (this.MAP_TEMP[x - 1][y] !== 0) {
                r.angle = 270;
              } else if (this.MAP_TEMP[x + 1][y] !== 0) {
                r.angle = 90;
              }

              this.MAP_ROOM_ID[ROOM1]++;
              break;
            case 2:
              if (this.MAP_TEMP[x - 1][y] > 0 && this.MAP_TEMP[x + 1][y] > 0) {
                if (
                  this.MAP_ROOM_ID[ROOM2] < max_rooms &&
                  this.MAP_NAME[x][y] === ""
                ) {
                  if (this.MAP_ROOM[ROOM2][this.MAP_ROOM_ID[ROOM2]] !== "") {
                    this.MAP_NAME[x][y] =
                      this.MAP_ROOM[ROOM2][this.MAP_ROOM_ID[ROOM2]];
                  }
                }

                r = this.#_create_room(
                  zone,
                  ROOM2,
                  x * 8,
                  0,
                  y * 8,
                  this.MAP_NAME[x][y]
                );
                if (this.rng.rand(2) === 1) {
                  r.angle = 90;
                } else {
                  r.angle = 270;
                }
                this.MAP_ROOM_ID[ROOM2]++;
              } else if (
                this.MAP_TEMP[x][y - 1] > 0 &&
                this.MAP_TEMP[x][y + 1] > 0
              ) {
                if (
                  this.MAP_ROOM_ID[ROOM2] < max_rooms &&
                  this.MAP_NAME[x][y] === ""
                ) {
                  if (this.MAP_ROOM[ROOM2][this.MAP_ROOM_ID[ROOM2]] !== "") {
                    this.MAP_NAME[x][y] =
                      this.MAP_ROOM[ROOM2][this.MAP_ROOM_ID[ROOM2]];
                  }
                }
                r = this.#_create_room(
                  zone,
                  ROOM2,
                  x * 8,
                  0,
                  y * 8,
                  this.MAP_NAME[x][y]
                );
                if (this.rng.rand(2) === 1) {
                  r.angle = 180;
                }
                this.MAP_ROOM_ID[ROOM2]++;
              } else {
                if (
                  this.MAP_ROOM_ID[ROOM2C] < max_rooms &&
                  this.MAP_NAME[x][y] === ""
                ) {
                  if (this.MAP_ROOM[ROOM2C][this.MAP_ROOM_ID[ROOM2C]] !== "") {
                    this.MAP_NAME[x][y] =
                      this.MAP_ROOM[ROOM2C][this.MAP_ROOM_ID[ROOM2C]];
                  }
                }

                if (
                  this.MAP_TEMP[x - 1][y] > 0 &&
                  this.MAP_TEMP[x][y + 1] > 0
                ) {
                  r = this.#_create_room(
                    zone,
                    ROOM2C,
                    x * 8,
                    0,
                    y * 8,
                    this.MAP_NAME[x][y]
                  );
                  r.angle = 180;
                } else if (
                  this.MAP_TEMP[x + 1][y] > 0 &&
                  this.MAP_TEMP[x][y + 1] > 0
                ) {
                  r = this.#_create_room(
                    zone,
                    ROOM2C,
                    x * 8,
                    0,
                    y * 8,
                    this.MAP_NAME[x][y]
                  );
                  r.angle = 90;
                } else if (
                  this.MAP_TEMP[x - 1][y] > 0 &&
                  this.MAP_TEMP[x][y - 1] > 0
                ) {
                  r = this.#_create_room(
                    zone,
                    ROOM2C,
                    x * 8,
                    0,
                    y * 8,
                    this.MAP_NAME[x][y]
                  );
                  r.angle = 270;
                } else {
                  r = this.#_create_room(
                    zone,
                    ROOM2C,
                    x * 8,
                    0,
                    y * 8,
                    this.MAP_NAME[x][y]
                  );
                }

                this.MAP_ROOM_ID[ROOM2C]++;
              }
              break;
            case 3:
              if (
                this.MAP_ROOM_ID[ROOM3] < max_rooms &&
                this.MAP_NAME[x][y] === ""
              ) {
                if (this.MAP_ROOM[ROOM3][this.MAP_ROOM_ID[ROOM3]] !== "") {
                  this.MAP_NAME[x][y] =
                    this.MAP_ROOM[ROOM3][this.MAP_ROOM_ID[ROOM3]];
                }
              }

              r = this.#_create_room(
                zone,
                ROOM3,
                x * 8,
                0,
                y * 8,
                this.MAP_NAME[x][y]
              );
              if (this.MAP_TEMP[x][y - 1] === 0) {
                r.angle = 180;
              } else if (this.MAP_TEMP[x - 1][y] === 0) {
                r.angle = 90;
              } else if (this.MAP_TEMP[x + 1][y] === 0) {
                r.angle = 270;
              }
              this.MAP_ROOM_ID[ROOM3]++;
              break;
            case 4:
              if (
                this.MAP_ROOM_ID[ROOM4] < max_rooms &&
                this.MAP_NAME[x][y] === ""
              ) {
                if (this.MAP_ROOM[ROOM4][this.MAP_ROOM_ID[ROOM4]] !== "") {
                  this.MAP_NAME[x][y] =
                    this.MAP_ROOM[ROOM4][this.MAP_ROOM_ID[ROOM4]];
                }
              }

              r = this.#_create_room(
                zone,
                ROOM4,
                x * 8,
                0,
                y * 8,
                this.MAP_NAME[x][y]
              );
              this.MAP_ROOM_ID[ROOM4] += 1;
          }
        }
      }
    }

    r = this.#_create_room(0, ROOM1, (MAP_WIDTH - 1) * 8, 500, 8, "gatea");
    this.MAP_ROOM_ID[ROOM1]++;

    r = this.#_create_room(
      0,
      ROOM1,
      (MAP_WIDTH - 1) * 8,
      0,
      (MAP_HEIGHT - 1) * 8,
      "pocketdimension"
    );
    this.MAP_ROOM_ID[ROOM1]++;

    r = this.#_create_room(0, ROOM1, 8, 800, 0, "dimension1499");
    this.MAP_ROOM_ID[ROOM1]++;

    for (let y = 0; y <= MAP_HEIGHT; y++) {
      for (let x = 0; x <= MAP_WIDTH; x++) {
        this.MAP_TEMP[x][y] = Math.min(this.MAP_TEMP[x][y], 1);
      }
    }

    /*
     * normally we dont need the following door-spawning code,
     * but there are EXACTLY 2 `Rand` statements of the
     * loop that we DO need to execute
     */
    for (let y = MAP_HEIGHT; y >= 0; y--) {
      if (y < i_zone.transition[1] - 1) {
        zone = 3;
      } else if (
        y >= i_zone.transition[1] - 1 &&
        y < i_zone.transition[0] - 1
      ) {
        zone = 2;
      } else {
        zone = 1;
      }

      for (let x = MAP_WIDTH; x >= 0; x--) {
        if (this.MAP_TEMP[x][y] > 0) {
          temp = zone === 2 ? 2 : 0;

          for (let r of ROOMS) {
            r.angle = wrap_angle(r.angle);
            if (Math.floor(r.x / 8.0) === x && Math.floor(r.z / 8.0) === y) {
              let shouldSpawnDoor = false;
              switch (
                str_to_shape((ROOM_TEMPLATES[r.template] ?? {})["shape"] ?? "0")
              ) {
                case ROOM1:
                  if (r.angle === 90) {
                    shouldSpawnDoor = true;
                  }
                  break;
                case ROOM2:
                  if (r.angle === 90 || r.angle === 270) {
                    shouldSpawnDoor = true;
                  }
                  break;
                case ROOM2C:
                  if (r.angle === 0 || r.angle === 90) {
                    shouldSpawnDoor = true;
                  }
                  break;
                case ROOM3:
                  if (r.angle === 0 || r.angle === 180 || r.angle === 90) {
                    shouldSpawnDoor = true;
                  }
                  break;
                default:
                  shouldSpawnDoor = true;
                  break;
              }

              if (shouldSpawnDoor) {
                if (x + 1 < MAP_WIDTH + 1) {
                  if (this.MAP_TEMP[x + 1][y] > 0) {
                    this.rng.rand(-3, 1);
                    /*
                     * We dont care about creating the actual door.
                     * We only advance the random seed by one.
                     */
                  }
                }
              }

              shouldSpawnDoor = false;
              switch (
                str_to_shape((ROOM_TEMPLATES[r.template] ?? {})["shape"] ?? "0")
              ) {
                case ROOM1:
                  if (r.angle === 180) {
                    shouldSpawnDoor = true;
                  }
                  break;
                case ROOM2:
                  if (r.angle === 0 || r.angle === 180) {
                    shouldSpawnDoor = true;
                  }
                  break;
                case ROOM2C:
                  if (r.angle === 180 || r.angle === 90) {
                    shouldSpawnDoor = true;
                  }
                case ROOM3:
                  if (r.angle === 180 || r.angle === 90 || r.angle === 270) {
                    shouldSpawnDoor = true;
                  }
                default:
                  shouldSpawnDoor = true;
                  break;
              }

              if (shouldSpawnDoor) {
                if (y + 1 < MAP_HEIGHT + 1) {
                  if (this.MAP_TEMP[x][y + 1] > 0) {
                    this.rng.rand(-3, 1);
                    // See comment above on creating door
                  }
                }
              }
            }
          }
        }
      }
    }

    for (let r of ROOMS) {
      r.angle = wrap_angle(r.angle);

      for (let r2 of ROOMS) {
        if (r !== r2) {
          if (r2.z === r.z) {
            if (r2.x === r.x + 8.0) {
              r.adjacent[0] = r2;
            } else if (r2.x === r.x - 8.0) {
              r.adjacent[2] = r2;
            }
          } else if (r2.x === r.x) {
            if (r2.z === r.z - 8.0) {
              r.adjacent[1] = r2;
            } else if (r2.z === r.z + 8.0) {
              r.adjacent[3] = r2;
            }
          }
        }

        if (
          r.adjacent[0] !== null &&
          r.adjacent[1] !== null &&
          r.adjacent[2] !== null &&
          r.adjacent[3] !== null
        ) {
          break;
        }
      }
    }
  }

  /**
   * Visualize the created map inside the provided grid element
   * @param {Node} element
   */
  visualize(element) {
    while (element.children.length > 1) {
      let child = element.lastChild;
      for (let key in child.dataset) {
        delete child.dataset[key];
      }
      element.removeChild(child);
      child.remove();
    }

    let children = [];
    for (let i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
      children.push(document.createElement("div"));
    }

    ROOMS.forEach((r, idx) => {
      let x = Math.floor(r.x / 8),
        y = Math.floor(r.z / 8),
        child = children[y * MAP_WIDTH + (MAP_WIDTH - x)],
        data = child.dataset;

      if (r.zone === 0) return;

      data.zone = r.zone;
      data.shape = r.shape;
      data.template = r.template;
      data.nodecals = ROOM_TEMPLATES.data[r.template]["disabledecals"];

      let angle = r.angle;
      if (angle === 90) data.angle = angle + 180;
      else if (angle === 270) data.angle = angle - 180;
      else data.angle = r.angle;

      child.style.backgroundImage = `url("src/data/${
        r.template.startsWith("checkpoint") ? "c2" : r.shape
      }.svg")`;

      child.onclick = () => {
        this.room_click(element, idx, x, y);
      };
    });

    children.forEach((c) => {
      c.classList.add("tile");
      element.appendChild(c);
    });
  }

  /**
   * @param {Node} element
   * @param {number} idx
   * @param {number} x
   * @param {number} y
   */
  room_click(element, idx, x, y) {
    element.childNodes.forEach((c) => c.classList?.remove("sel"));
    element.childNodes
      .item(y * MAP_WIDTH + (MAP_WIDTH - x) + 3)
      .classList.add("sel");

    let room = ROOMS[idx],
      setText = (id, txt) => (document.getElementById(id).innerText = txt);

    setText("rname", room.template);
    setText("rdesc", ROOM_TEMPLATES.data[room.template]["descr"]);
    setText("rcomm", ROOM_TEMPLATES.data[room.template]["commonness"]);
    setText("rlarg", ROOM_TEMPLATES.data[room.template]["large"] == "true");
    setText(
      "rdeca",
      ROOM_TEMPLATES.data[room.template]["disabledecals"] == "true"
    );
  }
}

export { MapGen };

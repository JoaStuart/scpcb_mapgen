import { IniReader } from "./ini_reader.js";

const ROOM_TEMPLATES = new IniReader("data/rooms.ini"),
  ROOM_SCALE = 8.0 / 2048.0,
  ZONEAMOUNT = 3,
  MAP_WIDTH = 18, // Normally loaded from `options.ini`|>options|>map size
  MAP_HEIGHT = 18, // Normally loaded from `options.ini`|>options|>map size
  ROOM1 = 1,
  ROOM2 = 2,
  ROOM2C = 3,
  ROOM3 = 4,
  ROOM4 = 5,
  SHAPES = {
    1: "1",
    2: "2",
    3: "2C",
    4: "3",
    5: "4",
  };

export {
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
  SHAPES,
};

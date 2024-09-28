import { MapGen } from "./mapgen.js";
import { ROOMS } from "./blitzbasic.js";
import { GRIDSIZE, ZONECOLOR } from "./constants.js";

const map = document.querySelector("#map canvas"),
  seed = document.getElementById("seed");
var c = null;

function displaySeed() {
  if (c === null) c = map.getContext("2d");

  let generator = new MapGen(seed.value);
  generator.create_map();
  drawMap(generator);
}

function drawMap(generator) {
  c.fillStyle = ZONECOLOR[0];
  c.fillRect(0, 0, map.width, map.height);
  let w = Math.floor(map.width / 18 / 2),
    h = Math.floor(map.height / 18);

  for (let i = 0; i < 3; i++) {
    for (let r of ROOMS) {
      let x = Math.floor(r.x / 8) * w + w,
        y = Math.floor(r.z / 8) * h;

      if (i === 0) {
        if (r.zone === 0) continue;
        c.fillStyle = "#777777";
        c.fillRect(Math.floor(map.width / 2) - x + 1, y - 1, -w - 2, h + 2);
      } else if (i === 1) {
        c.fillStyle = ZONECOLOR[r.zone];
        c.fillRect(Math.floor(map.width / 2) - x, y, -w, h);
      } else if (i === 2) {
        let o = 0;
        for (let itm of r.items) {
          if (itm.abb != undefined) {
            c.fillStyle = "#000000";
            c.fillText(
              itm.abb,
              Math.floor(map.width / 2) - x - w,
              y + h / 2 + o
            );
            o += 10;
          }
        }
      }
    }
  }

  for (let i = 0; i < GRIDSIZE; i++) {
    for (let j = 0; j < GRIDSIZE; j++) {
      if (generator.forest.grid[j * GRIDSIZE + i] > 0) {
        c.fillStyle = "#777777";
        c.fillRect(Math.floor(map.width / 2) + i * w, j * h, w, h);
      }
    }
  }
}

seed.oninput = displaySeed;

export { displaySeed };

import { MapGen } from "./mapgen.js";
import { ROOM_TEMPLATES } from "./constants.js";

const grid = document.getElementById("map"),
  seed = document.getElementById("seed"),
  zones = document.getElementById("zones"),
  no106 = document.getElementById("no106");

var generator = null;

function displaySeed() {
  let start = performance.now();
  generator = new MapGen(seed.value);
  generator.create_map();

  generator.visualize(grid);
  let end = performance.now();
}

seed.oninput = displaySeed;

function btnUnselect(btns) {
  btns.forEach((c) => {
    c.classList?.remove("selected");
  });
}

zones.onclick = (e) => {
  no106.classList.remove("selected");
  zones.classList.add("selected");
  grid.classList.remove("no106");
  grid.classList.add("zones");
};
no106.onclick = (e) => {
  zones.classList.remove("selected");
  no106.classList.add("selected");
  grid.classList.remove("zones");
  grid.classList.add("no106");
};

export { displaySeed };

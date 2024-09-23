import { SHAPES } from "./constants.js";

function wrap_angle(angle) {
  if (angle < 0) {
    return wrap_angle(360 + angle);
  } else if (angle > 359) {
    return wrap_angle(angle - 360);
  } else {
    return angle;
  }
}

function str_to_shape(name) {
  for (let k of Object.keys(SHAPES)) {
    let v = SHAPES[k];
    if (v.toLowerCase() === name.toLowerCase()) {
      return parseInt(k);
    }
  }
  return null;
}

function shape_to_str(shape) {
  return SHAPES[shape];
}

function make_map(x, y, val) {
  let lx = [];
  for (let i = 0; i < x; i++) {
    lx.push(make_list(y, val));
  }

  return lx;
}

function make_list(len, val) {
  let ly = [];
  for (let j = 0; j < len; j++) ly.push(val);
  return ly;
}

export { wrap_angle, str_to_shape, shape_to_str, make_map, make_list };

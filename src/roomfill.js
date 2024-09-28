import { Rooms } from "./blitzbasic.js";
import {
  BRANCH_CHANCE,
  BRANCH_DIE_CHANCE,
  BRANCH_MAX_LIFE,
  CENTER,
  DEVIATION_CHANCE,
  GRIDSIZE,
  MAX_DEVIATION_DISTANCE,
  RETURN_CHANCE,
} from "./constants.js";
import { make_list } from "./utils.js";

function placeItem(r, name, abb) {
  if (abb == undefined) r.items.push({ name: name });
  else r.items.push({ name: name, abb: abb });
}

/**
 *
 * @param {Rooms} r
 */
function FillRoom(r, rng, parent) {
  console.log(r.template);
  switch (r.template) {
    case "room860":
      if (parent.forest === null) parent.forest = new Forest(rng);
      placeItem(r, "Document SCP-860-1", "860-1");
      placeItem(r, "Document SCP-860", "860");
      break;
    case "lockroom":
      break;
    case "lockroom2":
      for (let i = 0; i <= 5; i++) {
        rng.rand(2, 3);
        rng.rnd(-392, 520);
        rng.rnd(0, 0.001);
        rng.rnd(-392, 520);
        rng.rnd(360);
        rng.rnd(0.3, 0.6);
        rng.rand(15, 16);
        rng.rnd(-392, 520);
        rng.rnd(0, 0.001);
        rng.rnd(-392, 520);
        rng.rnd(360);
        rng.rnd(0.1, 0.6);
        rng.rand(15, 16);
        rng.rnd(-0.5, 0.5);
        rng.rnd(0, 0.001);
        rng.rnd(-0.5, 0.5);
        rng.rnd(360);
        rng.rnd(0.1, 0.6);
      }
      break;
    case "gatea":
      break;
    case "gateaentrance":
      break;
    case "exit1":
      break;
    case "roompj":
      placeItem(r, "Document SCP-372", "372");
      placeItem(r, "Radio Transceiver");
      break;
    case "room079":
      rng.rnd(360);
      break;
    case "checkpoint1":
      break;
    case "checkpoint2":
      break;
    case "room2pit":
      break;
    case "room2testroom2":
      placeItem(r, "Level 2 Key Card");
      placeItem(r, "S-NAV 300 Navigator");
      break;
    case "room3tunnel":
      break;
    case "room2toilets":
      break;
    case "room2storage":
      placeItem(r, "Document SCP-939", "939");
      placeItem(r, "9V Battery");
      placeItem(r, "Empty Cup");
      placeItem(r, "Level 1 Key Card");
      break;
    case "room2sroom":
      placeItem(r, "Some SCP-420-J");
      placeItem(r, "Some SCP-420-J");
      placeItem(r, "Level 5 Key Card");
      placeItem(r, "Nuclear Device Document", "NDD");
      placeItem(r, "Radio Transceiver");
      break;
    case "room2shaft":
      placeItem(r, "Level 3 Key Card");
      placeItem(r, "First Aid Kit");
      placeItem(r, "9V Battery");
      placeItem(r, "9V Battery");
      placeItem(r, "ReVision Eyedrops");
      rng.rnd(360);
      break;
    case "room2poffices":
      placeItem(r, "Mysterious Note", "MN");
      placeItem(r, "Ballistic Vest");
      placeItem(r, "Incident Report SCP-106-0204", "106-0204");
      placeItem(r, "Journal Page", "J");
      placeItem(r, "First Aid Kit");
      break;
    case "room2poffices2":
      rng.rand(360);
      rng.rand(360);
      rng.rand(360);
      placeItem(r, "Dr. L's Burnt Note", "LBN");
      placeItem(r, "Dr L's Burnt Note");
      placeItem(r, "The Modular Site Project", "MSP");
      break;
    case "room2elevator":
      break;
    case "room2cafeteria":
      placeItem(r, "Cup of Orange Juice");
      placeItem(r, "Cup of Coffee");
      placeItem(r, "Empty Cup");
      placeItem(r, "Quarter");
      placeItem(r, "Quarter");
      break;
    case "room2nuke":
      placeItem(r, "Nuclear Device Document", "NDD");
      placeItem(r, "Ballistic Vest");
      break;
    case "room2tunnel":
      rng.rand(360);
      placeItem(r, "Scorched Note", "SN");
      break;
    case "008":
      placeItem(r, "Hazmat Suit");
      placeItem(r, "Document SCP-008", "008");
      break;
    case "room035":
      placeItem(r, "SCP-035 Addendum", "035A");
      placeItem(r, "Radio Transceiver");
      placeItem(r, "SCP-500-01");
      placeItem(r, "Metal Panel (SCP-148)");
      placeItem(r, "Document SCP-035", "035");
      break;
    case "room513":
      placeItem(r, "SCP-513");
      placeItem(r, "Blood-stained Note", "BSN");
      placeItem(r, "Document SCP-513", "513");
      break;
    case "room966":
      placeItem(r, "Night Vision Goggles");
      break;
    case "room3storage":
      rng.rand(3);
      rng.rnd(360);
      placeItem(r, "Black Severed Hand");
      placeItem(r, "Night Vision Goggles");
      break;
    case "room049":
      placeItem(r, "Document SCP-049", "049");
      placeItem(r, "Level 4 Key Card");
      placeItem(r, "First Aid Kit");
      break;
    case "room2_2":
      break;
    case "room012":
      placeItem(r, "Document SCP-012", "012");
      placeItem(r, "Severed Hand");
      rng.rnd(360);
      break;
    case "tunnel2":
      break;
    case "room2pipes":
      break;
    case "room3pit":
      break;
    case "room2servers":
      break;
    case "room3servers":
      placeItem(r, "9V Battery");
      if (rng.rand(2) == 1) placeItem(r, "9V Battery");
      if (rng.rand(2) == 1) placeItem(r, "9V Battery");

      placeItem(r, "S-NAV 300 Navigator");
      break;
    case "room3servers2":
      placeItem(r, "Document SCP-970", "970");
      placeItem(r, "Gas Mask");
      break;
    case "testroom":
      placeItem(r, "Document SCP-682", "682");
      break;
    case "room2closets":
      placeItem(r, "Document SCP-1048", "1048");
      placeItem(r, "Gas Mask");
      placeItem(r, "9V Battery");
      if (rng.rand(2) == 1) placeItem(r, "9V Battery");
      if (rng.rand(2) == 1) placeItem(r, "9V Battery");
      placeItem(r, "Level 1 Key Card");
      placeItem(r, "Clipboard");
      placeItem(r, "Incident Report SCP-1048-A", "1048-A");
      break;
    case "room2offices":
      placeItem(r, "Document SCP-106", "106");
      placeItem(r, "Level 2 Key Card");
      placeItem(r, "S-NAV 300 Navigator");
      placeItem(r, "Notification", "N");
      break;
    case "room2offices2":
      placeItem(r, "Level 1 Key Card");
      placeItem(r, "Document SCP-895", "895");
      if (rng.rand(2) == 1) placeItem(r, "Document SCP-860", "860");
      else placeItem(r, "SCP-093 Recovered Materials", "093RM");
      placeItem(r, "S-NAV 300 Navigator");
      rng.rand(1, 4);
      break;
    case "room2offices3":
      if (rng.rand(2) == 1) placeItem(r, "Mobile Task Forces", "MTF");
      else placeItem(r, "Security Clearance Levels", "SCL");

      placeItem(r, "Object Classes", "OC");
      placeItem(r, "Document", "DOC");
      placeItem(r, "Radio Transceiver");

      for (let i = 0; i <= rng.rand(0, 1); i++)
        placeItem(r, "ReVision Eyedrops");

      placeItem(r, "9V Battery");
      if (rng.rand(2) == 1) placeItem(r, "9V Battery");
      if (rng.rand(2) == 1) placeItem(r, "9V Battery");
      break;
    case "start":
      rng.rand(360);
      rng.rand(360);
      break;
    case "room2scps":
      placeItem(r, "SCP-714");
      placeItem(r, "SCP-1025");
      placeItem(r, "SCP-860");
      placeItem(r, "Document SCP-714", "714");
      placeItem(r, "Document SCP-427", "427");

      for (let i = 0; i <= 14; i++) {
        rng.rand(15, 16);
        rng.rand(360);
        if (i > 10) rng.rnd(0.2, 0.25);
        else rng.rnd(0.1, 0.17);
      }
      break;
    case "room205":
      break;
    case "endroom":
      break;
    case "endroomc":
      break;
    case "coffin":
      placeItem(r, "Document SCP-895", "895");
      placeItem(r, "Level 3 Key Card");
      placeItem(r, "Night Vision Goggles");
      rng.rand(360);
    case "room2tesla":
    case "room2tesla_lcz":
    case "room2tesla_hcz":
      break;
    case "room2doors":
      break;
    case "914":
      placeItem(r, "Addendum: 5/14 Test Log", "A5/14");
      placeItem(r, "First Aid Kit");
      placeItem(r, "Dr. L's Note", "DLN");
      break;
    case "173":
      rng.rand(4, 5);
      rng.rnd(360);
      for (let xtemp = 0; xtemp <= 1; xtemp++) {
        for (let ytemp = 0; ytemp <= 1; ytemp++) {
          rng.rand(4, 6);
          rng.rnd(-0.5, 0.5);
          rng.rnd(0.001, 0.0018);
          rng.rnd(-0.5, 0.5);
          rng.rnd(360);
          rng.rnd(0.5, 0.8);
          rng.rnd(0.8, 1.0);
        }
      }
      placeItem(r, "Class D Orientation Leaflet", "CDOL");
      break;
    case "room2ccont":
      placeItem(r, "Note from Daniel", "NFD");
      break;
    case "room106":
      placeItem(r, "Level 5 Key Card");
      placeItem(r, "Dr. Allok's Note", "DAN");
      placeItem(r, "Recall Protocol RP-106-N", "106-N");
      break;
    case "room1archive":
      for (let xtemp = 0; xtemp <= 1; xtemp++) {
        for (let ytemp = 0; ytemp <= 2; ytemp++) {
          for (let ztemp = 0; ztemp <= 2; ztemp++) {
            let tempstr = "9V Battery",
              tempstr2 = "",
              chance = rng.rand(-10, 100);
            if (chance < 0) {
            } else if (chance < 40) {
              tempstr = "Document SCP-";
              switch (rng.rand(1, 6)) {
                case 1:
                  tempstr2 = "1123";
                  break;
                case 2:
                  tempstr2 = "1048";
                  break;
                case 3:
                  tempstr2 = "939";
                  break;
                case 4:
                  tempstr2 = "682";
                  break;
                case 5:
                  tempstr2 = "079";
                  break;
                case 6:
                  tempstr2 = "096";
                  break;
                // case 6:
                //   tempstr2 = "966";
                //   break;
              }
              tempstr += tempstr2;
            } else if (chance < 45) {
              tempstr = `Level ${rng.rand(1, 2)} Key Card`;
            } else if (chance < 50) {
              tempstr = "First Aid Kit";
            } else if (chance < 60) {
              tempstr = "9V Battery";
            } else if (chance < 70) {
              tempstr = "S-NAV 300 Navigator";
            } else if (chance < 85) {
              tempstr = "Radio Transceiver";
            } else if (chance < 95) {
              tempstr = "Clipboard";
            } else if (chance <= 100) {
              switch (rng.rand(1, 3)) {
                case 1:
                  tempstr = "Playing Card";
                  break;
                case 2:
                  tempstr = "Mastercard";
                case 3:
                  tempstr = "Origami";
              }
            }
            rng.rnd(-96.0, 96.0);
            placeItem(r, tempstr, tempstr2.length == 0 ? undefined : tempstr2);
          }
        }
      }
      break;
    case "room2test1074":
      placeItem(r, "Document SCP-1074", "1074");
      break;
    case "room1123":
      placeItem(r, "Document SCP-1123", "1123");
      placeItem(r, "SCP-1123");
      placeItem(r, "Leaflet", "L");
      placeItem(r, "Gas Mask");
      break;
    case "pocketdimension":
      placeItem(r, "Burnt Note", "BN");
      rng.rnd(0.8, 0.8);
      for (let i = 1; i <= 8; i++) {
        if (i < 6) rng.rnd(0.5, 0.5);
      }
      break;
    case "room3z3":
      break;
    case "room2_3":
    case "room3_3":
      break;
    case "room1lifts":
      break;
    case "room2servers2":
      placeItem(r, "Night Vision Goggles");
      rng.rand(245);
      break;
    case "room2gw_b":
      rng.rnd(360);
    case "room2gw":
      rng.rand(1, 2);
      break;
    case "room3gw":
      break;
    case "room1162":
      placeItem(r, "Document SCP-1162", "1162");
      break;
    case "room2scps2":
      placeItem(r, "SCP-1499");
      placeItem(r, "Document SCP-1499", "1499");
      placeItem(r, "Document SCP-500", "500");
      placeItem(r, "Emily Ross' Badge", "ERB");
      break;
    case "room3offices":
      break;
    case "room2offices4":
      placeItem(r, "Sticky Note", "SN");
      break;
    case "room2sl":
      break;
    case "room2_4":
      break;
    case "room3z2":
      break;
    case "lockroom3":
      break;
    case "medibay":
      placeItem(r, "First Aid Kit");
      placeItem(r, "Syringe");
      placeItem(r, "Syringe");
      break;
    case "room2cpit":
      placeItem(r, "Dr L's Note", "DLN");
      break;
    case "dimension1499":
      break;
  }
}

class Forest {
  rng;
  door1_pos;
  door2_pos;
  grid;

  constructor(rng) {
    this.rng = rng;
    this.door1_pos = rng.rand(3, 7);
    this.door2_pos = rng.rand(3, 7);

    this.grid = make_list(GRIDSIZE * GRIDSIZE, 0);
    this.gen_path();
  }

  chance(c) {
    return this.rng.rand(0, 100) <= c;
  }

  turn_if_deviating(max_deviation_distance, pathx, center, dir, retval = 0) {
    // ORIG COMMENT ;check if deviating and return the answer. if deviating, turn around
    let current_deviation = center - pathx,
      deviated = false;
    if (
      (dir == 0 && current_deviation >= max_deviation_distance) ||
      (dir == 2 && current_deviation <= -max_deviation_distance)
    ) {
      dir = (dir + 2) % 4;
      deviated = true;
    }
    if (retval == 0) return dir;
    else return deviated;
  }

  move_forward(dir, pathx, pathy, retval = 0) {
    // ORIG COMMENT ;move 1 unit along the grid in the designated direction
    if (dir == 1) {
      if (retval == 0) return pathx;
      return pathy + 1;
    }
    if (retval == 0) return pathx - 1 + dir;
    return pathy;
  }

  gen_path() {
    this.grid[this.door1_pos] = 3;
    this.grid[(GRIDSIZE - 1) * GRIDSIZE + this.door2_pos] = 3;
    return;

    let pathx = this.door2_pos,
      pathy = 1,
      dir = 1;
    this.grid[(GRIDSIZE - 1) * GRIDSIZE + pathx] = 1;

    let deviated;

    while (pathy < GRIDSIZE - 4) {
      if (dir == 1) {
        // ORIG COMMENT ;determine whether to go forward or to the side
        if (this.chance(DEVIATION_CHANCE)) {
          // ORIG COMMENT ;pick a branch direction
          dir = 2 * this.rng.rand(0, 1);
          // ORIG COMMENT ;make sure you have not passed max side distance
          dir = this.turn_if_deviating(
            MAX_DEVIATION_DISTANCE,
            pathx,
            CENTER,
            dir
          );
          deviated = this.turn_if_deviating(
            MAX_DEVIATION_DISTANCE,
            pathx,
            CENTER,
            dir,
            1
          );
          if (deviated)
            this.grid[(GRIDSIZE - 1 - pathy) * GRIDSIZE + pathx] = 1;
          pathx = this.move_forward(dir, pathx, pathy);
          pathy = this.move_forward(dir, pathx, pathy, 1);
        }
      } else {
        // ORIG COMMENT ;we are going to the side, so determine whether to keep going or go forward again
        dir = this.turn_if_deviating(
          MAX_DEVIATION_DISTANCE,
          pathx,
          CENTER,
          dir
        );
        deviated = this.turn_if_deviating(
          MAX_DEVIATION_DISTANCE,
          pathx,
          CENTER,
          dir,
          1
        );
        if (deviated || this.chance(RETURN_CHANCE)) dir = 1;

        pathx = this.move_forward(dir, pathx, pathy);
        pathx = this.move_forward(dir, pathx, pathy, 1);
        // ORIG COMMENT ;if we just started going forward go twice so as to avoid creating a potential 2x2 line
        if (dir == 1) {
          this.grid[(GRIDSIZE - 1 - pathy) * GRIDSIZE + pathx] = 1;
          pathx = this.move_forward(dir, pathx, pathy);
          pathy = this.move_forward(dir, pathx, pathy, 1);
        }
      }

      // ORIG COMMENT ;add our position to the grid
      this.grid[(GRIDSIZE - 1 - pathy) * GRIDSIZE + pathx] = 1;
    }

    // ORIG COMMENT ;finally, bring the path back to the door now that we have reached the end
    dir = 1;
    while (pathy < GRIDSIZE - 2) {
      pathx = this.move_forward(dir, pathx, pathy);
      pathy = this.move_forward(dir, pathx, pathy, 1);
      this.grid[(GRIDSIZE - 1 - pathy) * GRIDSIZE + pathx] = 1;
    }

    if (pathx != this.door1_pos) {
      dir = 0;
      if (this.door1_pos > pathx) dir = 2;
      while (pathx != this.door1_pos) {
        pathx = this.move_forward(dir, pathx, pathy);
        pathy = this.move_forward(dir, pathx, pathy, 1);
        this.grid[(GRIDSIZE - 1 - pathy) * GRIDSIZE + pathx] = 1;
      }
    }

    // ORIG COMMENT ;attempt to create new branches
    let new_y, temp_y, new_x, branch_type, branch_pos;
    new_y = -3; // ORIG COMMENT ;used for counting off; branches will only be considered once every 4 units so as to avoid potentially too many branches
    while (new_y < GRIDSIZE - 6) {
      new_y = new_y + 4;
      temp_y = new_y;
      new_x = 0;
      if (this.chance(BRANCH_CHANCE)) {
        branch_type = -1;
        // if (this.chance(cobble_chance)) {
        //   // TODO WHAT DA F*** IS COBBLE_CHANCE
        //   branch_type = -2;
        // }

        // ORIG COMMENT ;create a branch at this spot
        //              ;determine if on left or on right
        branch_pos = 2 * this.rng.rand(0, 1);
        // ORIG COMMENT ;get leftmost or rightmost path in this row
        let leftmost = GRIDSIZE,
          rightmost = 0;
        for (let i = 0; i <= GRIDSIZE; i++) {
          if (this.grid[(GRIDSIZE - 1 - new_y) * GRIDSIZE + i] == 1) {
            if (i < leftmost) leftmost = i;
            if (i > rightmost) rightmost = i;
          }
        }

        if (branch_pos == 0) new_x = leftmost - 1;
        else new_x = rightmost + 1;
        // ORIG COMMENT ;before creating a branch make sure there are no 1's above or below
        if (
          (temp_y != 0 &&
            this.grid[(GRIDSIZE - 1 - temp_y + 1) * GRIDSIZE + new_x] == 1) ||
          this.grid[(GRIDSIZE - 1 - temp_y - 1) * GRIDSIZE + new_x] == 1
        ) {
          break;
        }
        this.grid[(GRIDSIZE - 1 - temp_y) * GRIDSIZE + new_x] = branch_type; // ORIG COMMENT ;make 4s so you don't confuse your branch for a path; will be changed later
        if (branch_pos == 0) new_x = leftmost - 2;
        else new_x = rightmost + 2;
        this.grid[(GRIDSIZE - 1 - temp_y) * GRIDSIZE + new_x] = branch_type; // ORIG COMMENT ;branch out twice to avoid creating an unwanted 2x2 path with the real path
        let i = 2;
        while (i < BRANCH_MAX_LIFE) {
          i++;
          if (this.chance(BRANCH_DIE_CHANCE)) break;

          if (this.rng.rand(0, 3) == 0) {
            // ORIG COMMENT ;have a higher chance to go up to confuse the player
            if (branch_pos == 0) new_x--;
            else new_x++;
          } else temp_y++;

          // ORIG COMMENT ;before creating a branch make sure there are no 1's above or below
          let n = (GRIDSIZE - 1 - temp_y + 1) * GRIDSIZE + new_x;
          if (n < GRIDSIZE - 1) {
            if (temp_y != 0 && this.grid[n] == 1) break;
          }
          n = (GRIDSIZE - 1 - temp_y - 1) * GRIDSIZE + new_x;
          if (n > 0) {
            if (this.grid[n] == 1) break;
          }

          this.grid[(GRIDSIZE - 1 - temp_y) * GRIDSIZE + new_x] = branch_type; // ORIG COMMENT ;make 4s so you don't confuse your branch for a path; will be changed later
          if (temp_y >= GRIDSIZE - 2) break;
        }
      }
    }

    // ORIG COMMENT ;change branches from 4s to 1s (they were 4s so that they didn't accidently create a 2x2 path unintentionally)
    for (let i = 0; i <= GRIDSIZE - 1; i++) {
      for (let j = 0; j <= GRIDSIZE - 1; j++) {
        if (this.grid[i * GRIDSIZE + j] == -1) this.grid[i * GRIDSIZE + j] = -2;
        else if (this.grid[i * GRIDSIZE + j] == -2)
          this.grid[i * GRIDSIZE + j] = 1;
      }
    }
  }
}

export { FillRoom };

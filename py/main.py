import math

from b3d import *
from utils import *
from terminal import *
from ini_reader import *
from constants import *

if __name__ != "__main__":
    exit(-1)

enable_win_ansi()


RANDOM_SEED = "dirtymetal"
rng = Blitz3DRandom(generate_seed_number(RANDOM_SEED))

MAP_NAME = Set([Set(["" for _ in range(MAP_HEIGHT)]) for _ in range(MAP_WIDTH)])
MAP_TEMP = Set([Set([0 for _ in range(MAP_HEIGHT + 1)]) for _ in range(MAP_WIDTH + 1)])

MAP_ROOM_ID = [0 for _ in range(ROOM4 + 1)]
MAP_ROOM = [["" for _ in range(ROOM4 + 1)]]


def get_zone(y: int) -> int:
    return min(
        math.floor((float(MAP_WIDTH - y) / MAP_WIDTH * ZONEAMOUNT)), ZONEAMOUNT - 1
    )


def set_room(
    room_name: str, room_type: int, pos: int, min_pos: int, max_pos: int
) -> bool:
    global MAP_ROOM
    """
    ORIG COMMENT ;place a room without overwriting others
    """

    if max_pos < min_pos:
        LOGGER.debug(f"Can't place {room_name}")
        return False

    LOGGER.debug(f"--- SETROOM: {room_name.upper()} ---")
    looped = False
    can_place = True
    while MAP_ROOM[room_type][pos] != "":
        LOGGER.debug(f"found {MAP_ROOM[room_type][pos]}")
        pos = pos + 1
        if pos > max_pos:
            if not looped:
                pos = min_pos + 1
                looped = True
            else:
                can_place = False
                break

    LOGGER.debug(f"{room_name} {pos}")
    if can_place:
        LOGGER.debug("--------------")
        MAP_ROOM[room_type][pos] = room_name
        return True
    else:
        LOGGER.debug(f"couldn't place {room_name}")
        return False


def create_room(
    zone: int, roomshape: int, x: float, y: float, z: float, name: str = ""
) -> Rooms | None:
    global MAP_ROOM

    r = Rooms(
        zone=zone,
        shape=roomshape,
        x=x,
        y=y,
        z=z,
    )

    if name != "":
        name = name.lower()
        for rt in ROOM_TEMPLATES.data.keys():
            if rt == name:
                r.template = rt
                return r

    temp = 0
    for name, rt in ROOM_TEMPLATES.data.items():
        for i in brange(0, 4):
            if int(rt.get(f"zone{i}", 0)) == zone:
                if str_to_shape(rt.get("shape", 0)) == roomshape:
                    temp = temp + int(rt.get("commonness", 0))
                    break

    random_room = rng.rand(temp)
    temp = 0
    for name, rt in ROOM_TEMPLATES.data.items():
        for i in brange(0, 4):
            commonness = int(rt.get("commonness", 0))
            if (
                int(rt.get(f"zone{i}", 0)) == zone
                and str_to_shape(rt.get("shape", "0")) == roomshape
            ):
                temp += commonness
                if random_room > temp - commonness and random_room <= temp:
                    r.template = name
                    return r
    # return r


def create_map() -> None:
    global MAP_ROOM

    # Dont blame me for the structure of this function,
    # just look at https://github.com/Regalis11/scpcb/blob/master/MapSystem.bb#L7023

    i_zone = I_Zone(
        transition=[13, 7],
        has_custom_forest=0,
        has_custom_mt=0,
    )

    x = math.floor(MAP_WIDTH / 2)
    y = MAP_HEIGHT - 2

    for i in brange(y, MAP_HEIGHT - 1):
        MAP_TEMP[x][i] = 1

    while y >= 2:
        width = rng.rand(10, 15)

        if x > MAP_WIDTH * 0.6:
            width = -width
        elif x > MAP_WIDTH * 0.4:
            x = x - width / 2

        # ORTIG COMMENT ;make sure the hallway doesn't go outside the array
        if x + width > MAP_WIDTH - 3:
            width = MAP_WIDTH - 3 - x
        elif x + width < 2:
            width = -x + 2

        x = min(x, x + width)
        width = abs(width)
        for i in brange(x, x + width):
            MAP_TEMP[min(i, MAP_WIDTH)][y] = 1

        height = rng.rand(3, 4)
        if y - height < 1:
            height = y - 1

        yhallways = rng.rand(4, 5)

        if get_zone(y - height) != get_zone(y - height + 1):
            height = height - 1

        for i in brange(1, yhallways):
            x2 = max(min(rng.rand(x, x + width - 1), MAP_WIDTH - 2), 2)
            while (
                MAP_TEMP[x2][y - 1]
                or MAP_TEMP[x2 - 1][y - 1]
                or MAP_TEMP[x2 + 1][y - 1]
            ):
                x2 = x2 + 1

            if x2 < x + width:
                if i == 1:
                    tempheight = height
                    if rng.rand(2) == 1:
                        x2 = x
                    else:
                        x2 = x + width
                else:
                    tempheight = rng.rand(height)

                for y2 in brange(y - tempheight, y):
                    if get_zone(y2) != get_zone(
                        y2 + 1
                    ):  # ORIG COMMENT ;a room leading from zone to another
                        MAP_TEMP[x2][y2] = 255
                    else:
                        MAP_TEMP[x2][y2] = 1

                if tempheight == height:
                    temp = x2

        x = temp
        y = y - height
    # Until y < 2

    LOGGER.warning(MAP_TEMP)

    room1_amount = [0, 0, 0]
    room2_amount = [0, 0, 0]
    room2c_amount = [0, 0, 0]
    room3_amount = [0, 0, 0]
    room4_amount = [0, 0, 0]

    # ORIG COMMENT ;count the amount of rooms
    for y in brange(1, MAP_HEIGHT - 1):
        zone = get_zone(y)

        for x in brange(1, MAP_WIDTH - 1):
            if MAP_TEMP[x][y] > 0:
                temp = min(MAP_TEMP[x + 1][y], 1) + min(MAP_TEMP[x - 1][y], 1)
                temp = temp + min(MAP_TEMP[x][y + 1], 1) + min(MAP_TEMP[x][y - 1], 1)
                if MAP_TEMP[x][y] < 255:
                    MAP_TEMP[x][y] = temp
                match MAP_TEMP[x][y]:
                    case 1:
                        room1_amount[zone] = room1_amount[zone] + 1
                    case 2:
                        if min(MAP_TEMP[x + 1][y], 1) + min(MAP_TEMP[x - 1][y], 1) == 2:
                            room2_amount[zone] = room2_amount[zone] + 1
                        elif (
                            min(MAP_TEMP[x][y + 1], 1) + min(MAP_TEMP[x][y - 1], 1) == 2
                        ):
                            room2_amount[zone] = room2_amount[zone] + 1
                        else:
                            room2c_amount[zone] = room2c_amount[zone] + 1
                    case 3:
                        room3_amount[zone] = room3_amount[zone] + 1
                    case 4:
                        room4_amount[zone] = room4_amount[zone] + 1

    # ORIG COMMENT ;force more room1s (if needed)
    for i in brange(0, 2):
        # ORIG COMMENT ;need more rooms if there are less than 5 of them
        temp = -room1_amount[i] + 5

        if temp > 0:
            for y in brange(
                (MAP_HEIGHT / ZONEAMOUNT) * (2 - i) + 1,
                ((MAP_HEIGHT / ZONEAMOUNT) * ((2 - i) + 1.0)) - 2,
            ):
                for x in brange(2, MAP_WIDTH - 2):
                    if MAP_TEMP[x][y] == 0:
                        if (
                            min(MAP_TEMP[x + 1][y], 1)
                            + min(MAP_TEMP[x - 1][y], 1)
                            + min(MAP_TEMP[x][y + 1], 1)
                            + min(MAP_TEMP[x][y - 1], 1)
                        ) == 1:
                            if MAP_TEMP[x + 1][y]:
                                x2 = x + 1
                                y2 = y
                            elif MAP_TEMP[x - 1][y]:
                                x2 = x - 1
                                y2 = y
                            elif MAP_TEMP[x][y + 1]:
                                x2 = x
                                y2 = y + 1
                            elif MAP_TEMP[x][y - 1]:
                                x2 = x
                                y2 = y - 1

                            placed = False
                            if MAP_TEMP[x2][y2] > 1 and MAP_TEMP[x2][y2] < 4:
                                match MAP_TEMP[x2][y2]:
                                    case 2:
                                        if (
                                            min(MAP_TEMP[x2 + 1][y2], 1)
                                            + min(MAP_TEMP[x2 - 1][y2], 1)
                                            == 2
                                        ):
                                            room2_amount[i] = room2_amount[i] - 1
                                            room3_amount[i] = room3_amount[i] + 1
                                            placed = True
                                        elif (
                                            min(MAP_TEMP[x2][y2 + 1], 1)
                                            + min(MAP_TEMP[x2][y2 - 1], 1)
                                            == 2
                                        ):
                                            room2_amount[i] = room2_amount[i] - 1
                                            room3_amount[i] = room3_amount[i] + 1
                                            placed = True
                                    case 3:
                                        room3_amount[i] = room3_amount[i] - 1
                                        room4_amount[i] = room4_amount[i] + 1
                                        placed = True

                                if placed:
                                    MAP_TEMP[x2][y2] = MAP_TEMP[x2][y2] + 1

                                    MAP_TEMP[x][y] = 1
                                    room1_amount[i] = room1_amount[i] + 1

                                    temp = temp - 1
                    if temp == 0:
                        break
                if temp == 0:
                    break

    # ORIG COMMENT ;force more room4s and room2Cs
    for i in brange(0, 2):
        match i:
            case 2:
                zone = 2
                temp2 = MAP_HEIGHT / 3
            case 1:
                zone = MAP_HEIGHT / 3 + 1
                temp2 = MAP_HEIGHT * (2.0 / 3.0) - 1
            case 0:
                zone = MAP_HEIGHT * (2.0 / 3.0) + 1
                temp2 = MAP_HEIGHT - 2

        if room4_amount[i] < 1:  # ORIG COMMENT ;we want at least 1 ROOM4
            LOGGER.debug(f"forcing a ROOM4 into zone {i}")
            temp = 0

            for y in brange(zone, temp2):
                for x in brange(2, MAP_WIDTH - 2):
                    if (
                        MAP_TEMP[x][y] == 3
                    ):  # ORIG COMMENT ;see if adding a ROOM1 is possible
                        # `Select 0` in original code
                        if (
                            MAP_TEMP[x + 1][y]
                            or MAP_TEMP[x + 1][y + 1]
                            or MAP_TEMP[x + 1][y - 1]
                            or MAP_TEMP[x + 2][y]
                        ) == 0:
                            MAP_TEMP[x + 1][y] = 1
                            temp = 1
                        elif (
                            MAP_TEMP[x - 1][y]
                            or MAP_TEMP[x - 1][y + 1]
                            or MAP_TEMP[x - 1][y - 1]
                            or MAP_TEMP[x - 2][y]
                        ) == 0:
                            MAP_TEMP[x - 1][y] = 1
                            temp = 1
                        elif (
                            MAP_TEMP[x][y + 1]
                            or MAP_TEMP[x + 1][y + 1]
                            or MAP_TEMP[x - 1][y + 1]
                            or MAP_TEMP[x][y + 2]
                        ) == 0:
                            MAP_TEMP[x][y + 1] = 1
                            temp = 1
                        elif (
                            MAP_TEMP[x][y - 1]
                            or MAP_TEMP[x + 1][y - 1]
                            or MAP_TEMP[x - 1][y - 1]
                            or MAP_TEMP[x][y - 2]
                        ) == 0:
                            MAP_TEMP[x][y - 1] = 1
                            temp = 1

                        if temp == 1:
                            MAP_TEMP[x][
                                y
                            ] = 4  # ORIG COMMENT ;turn this room into a ROOM4
                            LOGGER.debug(f"ROOM4 forced into slot ({x}, {y})")

                            room4_amount[i] += 1
                            room3_amount[i] -= 1
                            room1_amount[i] += 1

                    if temp == 1:
                        break

                if temp == 1:
                    break

            if temp == 0:
                LOGGER.debug(f"Couldn't place ROOM4 in zone {i}")

        if room2c_amount[i] < 1:  # ORIG COMMENT ;we want at least 1 ROOM2C
            LOGGER.debug(f"forcing a ROOM2C into zone {i}")
            temp = 0

            zone += 1
            temp2 -= 1

            for y in brange(zone, temp2):
                for x in brange(3, MAP_WIDTH - 3):
                    if MAP_TEMP[x][y] == 1:
                        # `Select True` ORIG COMMENT ;see if adding some rooms is possible
                        if MAP_TEMP[x - 1][y] > 0:
                            if (
                                MAP_TEMP[x][y - 1]
                                + MAP_TEMP[x][y + 1]
                                + MAP_TEMP[x + 2][y]
                            ) == 0:
                                if (
                                    MAP_TEMP[x + 1][y - 2]
                                    + MAP_TEMP[x + 2][y - 1]
                                    + MAP_TEMP[x + 1][y - 1]
                                ) == 0:
                                    MAP_TEMP[x][y] = 2
                                    MAP_TEMP[x + 1][y] = 2
                                    LOGGER.debug(
                                        f"ROOM2C forced into slot ({x + 1}, {y})"
                                    )
                                    MAP_TEMP[x + 1][y - 1] = 1
                                    temp = 1
                                elif (
                                    MAP_TEMP[x + 1][y + 2]
                                    + MAP_TEMP[x + 2][y + 1]
                                    + MAP_TEMP[x + 1][y + 1]
                                ) == 0:
                                    MAP_TEMP[x][y] = 2
                                    MAP_TEMP[x + 1][y] = 2
                                    LOGGER.debug(
                                        f"ROOM2C forced into slot ({x + 1}, {y})"
                                    )
                                    MAP_TEMP[x + 1][y + 1] = 1
                                    temp = 1
                        elif MAP_TEMP[x + 1][y] > 0:
                            if (
                                MAP_TEMP[x][y - 1]
                                + MAP_TEMP[x][y + 1]
                                + MAP_TEMP[x - 2][y]
                            ) == 0:
                                if (
                                    MAP_TEMP[x - 1][y - 2]
                                    + MAP_TEMP[x - 2][y - 1]
                                    + MAP_TEMP[x - 1][y - 1]
                                ) == 0:
                                    MAP_TEMP[x][y] = 2
                                    MAP_TEMP[x - 1][y] = 2
                                    LOGGER.debug(
                                        f"ROOM2C forced into slot ({x-1}, {y})"
                                    )
                                    MAP_TEMP[x - 1][y - 1] = 1
                                    temp = 1
                                elif (
                                    MAP_TEMP[x - 1][y + 2]
                                    + MAP_TEMP[x - 2][y + 1]
                                    + MAP_TEMP[x - 1][y + 1]
                                ) == 0:
                                    MAP_TEMP[x][y] = 2
                                    MAP_TEMP[x - 1][y] = 2
                                    LOGGER.debug(
                                        f"ROOM2C forced into slot ({x-1}, {y})"
                                    )
                                    MAP_TEMP[x - 1][y + 1] = 1
                                    temp = 1
                        elif MAP_TEMP[x][y - 1] > 0:
                            if (
                                MAP_TEMP[x - 1][y]
                                + MAP_TEMP[x + 1][y]
                                + MAP_TEMP[x][y + 2]
                            ) == 0:
                                if (
                                    MAP_TEMP[x - 2][y + 1]
                                    + MAP_TEMP[x - 1][y + 2]
                                    + MAP_TEMP[x - 1][y + 1]
                                ) == 0:
                                    MAP_TEMP[x][y] = 2
                                    MAP_TEMP[x][y + 1] = 2
                                    LOGGER.debug(
                                        f"ROOM2C forced into slot ({x}, {y+1})"
                                    )
                                    MAP_TEMP[x - 1][y + 1] = 1
                                    temp = 1
                                elif (
                                    MAP_TEMP[x + 2][y + 1]
                                    + MAP_TEMP[x + 1][y + 2]
                                    + MAP_TEMP[x + 1][y + 1]
                                ) == 0:
                                    MAP_TEMP[x][y] = 2
                                    MAP_TEMP[x][y + 1] = 2
                                    LOGGER.debug(
                                        f"ROOM2C forced into slot ({x}, {y+1})"
                                    )
                                    MAP_TEMP[x + 1][y + 1] = 1
                                    temp = 1
                        elif MAP_TEMP[x][y + 1] > 0:
                            if (
                                MAP_TEMP[x - 1][y]
                                + MAP_TEMP[x + 1][y]
                                + MAP_TEMP[x][y - 2]
                            ) == 0:
                                if (
                                    MAP_TEMP[x - 2][y - 1]
                                    + MAP_TEMP[x - 1][y - 2]
                                    + MAP_TEMP[x - 1][y - 1]
                                ) == 0:
                                    MAP_TEMP[x][y] = 2
                                    MAP_TEMP[x][y - 1] = 2
                                    LOGGER.debug(f"ROOM2C forced into slot ({x}, {y-1}")
                                    MAP_TEMP[x - 1][y - 1] = 1
                                    temp = 1
                                elif (
                                    MAP_TEMP[x + 2][y - 1]
                                    + MAP_TEMP[x + 1][y - 2]
                                    + MAP_TEMP[x + 1][y - 1]
                                ) == 0:
                                    MAP_TEMP[x][y] = 2
                                    MAP_TEMP[x][y - 1] = 2
                                    LOGGER.debug(
                                        f"ROOM2C forced into slot ({x}, {y-1})"
                                    )
                                    MAP_TEMP[x + 1][y - 1] = 1
                                    temp = 1

                        if temp == 1:
                            room2c_amount[i] += 1
                            room2_amount[i] += 1

                    if temp == 1:
                        break

                if temp == 1:
                    break

            if temp == 0:
                LOGGER.debug(f"Couldn't place ROOM2C in zone {i}")

    LOGGER.warning(MAP_TEMP)
    max_rooms = 55 * MAP_WIDTH // 20
    max_rooms = max(
        max_rooms,
        room1_amount[0] + room1_amount[1] + room1_amount[2] + 1,
    )
    max_rooms = max(
        max_rooms,
        room2_amount[0] + room2_amount[1] + room2_amount[2] + 1,
    )
    max_rooms = max(
        max_rooms,
        room2c_amount[0] + room2c_amount[1] + room2c_amount[2] + 1,
    )
    max_rooms = max(
        max_rooms,
        room3_amount[0] + room3_amount[1] + room3_amount[2] + 1,
    )
    max_rooms = max(
        max_rooms,
        room4_amount[0] + room4_amount[1] + room4_amount[2] + 1,
    )

    MAP_ROOM = [["" for _ in range(max_rooms)] for _ in range(ROOM4 + 1)]

    # ORIG COMMENT ;zone 1 --------------------------------------------------------------------------------------------------

    min_pos = 1
    max_pos = room1_amount[0] - 1

    MAP_ROOM[ROOM1][0] = "start"
    set_room("roompj", ROOM1, math.floor(0.1 * room1_amount[0]), min_pos, max_pos)
    set_room("914", ROOM1, math.floor(0.3 * room1_amount[0]), min_pos, max_pos)
    set_room("room1archive", ROOM1, math.floor(0.5 * room1_amount[0]), min_pos, max_pos)
    set_room("room205", ROOM1, math.floor(0.6 * room1_amount[0]), min_pos, max_pos)

    MAP_ROOM[ROOM2C][0] = "lockroom"

    max_pos = room2_amount[0] - 1

    MAP_ROOM[ROOM2][0] = "room2closets"
    set_room(
        "room2testroom2", ROOM2, math.floor(0.1 * (room2_amount[0])), min_pos, max_pos
    )
    set_room("room2scps", ROOM2, math.floor(0.2 * (room2_amount[0])), min_pos, max_pos)
    set_room(
        "room2storage", ROOM2, math.floor(0.3 * (room2_amount[0])), min_pos, max_pos
    )
    set_room("room2gw_b", ROOM2, math.floor(0.4 * (room2_amount[0])), min_pos, max_pos)
    set_room("room2sl", ROOM2, math.floor(0.5 * (room2_amount[0])), min_pos, max_pos)
    set_room("room012", ROOM2, math.floor(0.55 * (room2_amount[0])), min_pos, max_pos)
    set_room("room2scps2", ROOM2, math.floor(0.6 * (room2_amount[0])), min_pos, max_pos)
    set_room("room1123", ROOM2, math.floor(0.7 * (room2_amount[0])), min_pos, max_pos)
    set_room(
        "room2elevator", ROOM2, math.floor(0.85 * (room2_amount[0])), min_pos, max_pos
    )

    MAP_ROOM[ROOM3][math.floor(rng.rnd(0.2, 0.8) * (room3_amount[0]))] = "room3storage"
    MAP_ROOM[ROOM2C][math.floor(0.5 * (room2c_amount[0]))] = "room1162"
    MAP_ROOM[ROOM4][math.floor(0.3 * (room4_amount[0]))] = "room4info"

    # ORIG COMMENT ;zone 2 --------------------------------------------------------------------------------------------------

    min_pos = room1_amount[0]
    max_pos = room1_amount[0] + room1_amount[1] - 1

    set_room(
        "room079",
        ROOM1,
        room1_amount[0] + math.floor(0.15 * room1_amount[1]),
        min_pos,
        max_pos,
    )
    set_room(
        "room106",
        ROOM1,
        room1_amount[0] + math.floor(0.3 * room1_amount[1]),
        min_pos,
        max_pos,
    )
    set_room(
        "008",
        ROOM1,
        room1_amount[0] + math.floor(0.4 * room1_amount[1]),
        min_pos,
        max_pos,
    )
    set_room(
        "room035",
        ROOM1,
        room1_amount[0] + math.floor(0.5 * room1_amount[1]),
        min_pos,
        max_pos,
    )
    set_room(
        "coffin",
        ROOM1,
        room1_amount[0] + math.floor(0.7 * room1_amount[1]),
        min_pos,
        max_pos,
    )

    min_pos = room2_amount[0]
    max_pos = room2_amount[0] + room2_amount[1] - 1

    MAP_ROOM[ROOM2][room2_amount[0] + math.floor(0.1 * (room2_amount[1]))] = "room2nuke"
    set_room(
        "room2tunnel",
        ROOM2,
        room2_amount[0] + math.floor(0.25 * (room2_amount[1])),
        min_pos,
        max_pos,
    )
    set_room(
        "room049",
        ROOM2,
        room2_amount[0] + math.floor(0.4 * (room2_amount[1])),
        min_pos,
        max_pos,
    )
    set_room(
        "room2shaft",
        ROOM2,
        room2_amount[0] + math.floor(0.6 * (room2_amount[1])),
        min_pos,
        max_pos,
    )
    set_room(
        "testroom",
        ROOM2,
        room2_amount[0] + math.floor(0.7 * (room2_amount[1])),
        min_pos,
        max_pos,
    )
    set_room(
        "room2servers",
        ROOM2,
        room2_amount[0] + math.floor(0.9 * room2_amount[1]),
        min_pos,
        max_pos,
    )

    MAP_ROOM[ROOM3][room3_amount[0] + math.floor(0.3 * (room3_amount[1]))] = "room513"
    MAP_ROOM[ROOM3][room3_amount[0] + math.floor(0.6 * (room3_amount[1]))] = "room966"

    MAP_ROOM[ROOM2C][
        room2c_amount[0] + math.floor(0.5 * (room2c_amount[1]))
    ] = "room2cpit"

    # ORIG COMMENT ;zone 3  --------------------------------------------------------------------------------------------------

    MAP_ROOM[ROOM1][room1_amount[0] + room1_amount[1] + room1_amount[2] - 2] = "exit1"
    MAP_ROOM[ROOM1][
        room1_amount[0] + room1_amount[1] + room1_amount[2] - 1
    ] = "gateaentrance"
    MAP_ROOM[ROOM1][room1_amount[0] + room1_amount[1]] = "room1lifts"

    min_pos = room2_amount[0] + room2_amount[1]
    max_pos = room2_amount[0] + room2_amount[1] + room2_amount[2] - 1

    MAP_ROOM[ROOM2][min_pos + math.floor(0.1 * (room2_amount[2]))] = "room2poffices"
    set_room(
        "room2cafeteria",
        ROOM2,
        min_pos + math.floor(0.2 * (room2_amount[2])),
        min_pos,
        max_pos,
    )
    set_room(
        "room2sroom",
        ROOM2,
        min_pos + math.floor(0.3 * (room2_amount[2])),
        min_pos,
        max_pos,
    )
    set_room(
        "room2servers2",
        ROOM2,
        min_pos + math.floor(0.4 * room2_amount[2]),
        min_pos,
        max_pos,
    )
    set_room(
        "room2offices",
        ROOM2,
        min_pos + math.floor(0.45 * room2_amount[2]),
        min_pos,
        max_pos,
    )
    set_room(
        "room2offices4",
        ROOM2,
        min_pos + math.floor(0.5 * room2_amount[2]),
        min_pos,
        max_pos,
    )
    set_room(
        "room860", ROOM2, min_pos + math.floor(0.6 * room2_amount[2]), min_pos, max_pos
    )
    set_room(
        "medibay",
        ROOM2,
        min_pos + math.floor(0.7 * (room2_amount[2])),
        min_pos,
        max_pos,
    )
    set_room(
        "room2poffices2",
        ROOM2,
        min_pos + math.floor(0.8 * room2_amount[2]),
        min_pos,
        max_pos,
    )
    set_room(
        "room2offices2",
        ROOM2,
        min_pos + math.floor(0.9 * (room2_amount[2])),
        min_pos,
        max_pos,
    )

    MAP_ROOM[ROOM2C][room2c_amount[0] + room2c_amount[1]] = "room2ccont"
    MAP_ROOM[ROOM2C][room2c_amount[0] + room2c_amount[1] + 1] = "lockroom2"

    MAP_ROOM[ROOM3][
        room3_amount[0] + room3_amount[1] + math.floor(0.3 * (room3_amount[2]))
    ] = "room3servers"
    MAP_ROOM[ROOM3][
        room3_amount[0] + room3_amount[1] + math.floor(0.7 * (room3_amount[2]))
    ] = "room3servers2"
    MAP_ROOM[ROOM3][
        room3_amount[0] + room3_amount[1] + math.floor(0.5 * (room3_amount[2]))
    ] = "room3offices"

    # TRANSLATED COMMENT ;----------------------- creating map --------------------------------

    temp = 0
    spacing = 8.0  # TODO change constants to var

    for y in brange(MAP_HEIGHT - 1, 1, -1):
        if y < MAP_HEIGHT / 3 + 1:
            zone = 3
        elif y < MAP_HEIGHT * (2.0 / 3.0):
            zone = 2
        else:
            zone = 1

        for x in brange(1, MAP_WIDTH - 2):
            if MAP_TEMP[x][y] == 255:
                LOGGER.warning("Making checkpoint")
                if y > MAP_HEIGHT / 2:
                    r = create_room(zone, ROOM2, x * 8, 0, y * 8, "checkpoint1")
                else:
                    r = create_room(zone, ROOM2, x * 8, 0, y * 8, "checkpoint2")
            elif MAP_TEMP[x][y] > 0:
                temp = (
                    min(MAP_TEMP[x + 1][y], 1)
                    + min(MAP_TEMP[x - 1][y], 1)
                    + min(MAP_TEMP[x][y + 1], 1)
                    + min(MAP_TEMP[x][y - 1], 1)
                )

                match temp:  # TRANSLATED COMMENT ;rooms in adjacent squares
                    case 1:
                        if MAP_ROOM_ID[ROOM1] < max_rooms and MAP_NAME[x][y] == "":
                            if MAP_ROOM[ROOM1][MAP_ROOM_ID[ROOM1]] != "":
                                MAP_NAME[x][y] = MAP_ROOM[ROOM1][MAP_ROOM_ID[ROOM1]]

                        r = create_room(zone, ROOM1, x * 8, 0, y * 8, MAP_NAME[x][y])
                        if MAP_TEMP[x][y + 1] != 0:
                            r.angle = 180
                        elif MAP_TEMP[x - 1][y] != 0:
                            r.angle = 270
                        elif MAP_TEMP[x + 1][y] != 0:
                            r.angle = 90

                        MAP_ROOM_ID[ROOM1] += 1
                    case 2:
                        if MAP_TEMP[x - 1][y] > 0 and MAP_TEMP[x + 1][y] > 0:
                            if MAP_ROOM_ID[ROOM2] < max_rooms and MAP_NAME[x][y] == "":
                                if MAP_ROOM[ROOM2][MAP_ROOM_ID[ROOM2]] != "":
                                    MAP_NAME[x][y] = MAP_ROOM[ROOM2][MAP_ROOM_ID[ROOM2]]

                            r = create_room(
                                zone, ROOM2, x * 8, 0, y * 8, MAP_NAME[x][y]
                            )
                            if rng.rand(2) == 1:
                                r.angle = 90
                            else:
                                r.angle = 270
                            MAP_ROOM_ID[ROOM2] += 1
                        elif MAP_TEMP[x][y - 1] > 0 and MAP_TEMP[x][y + 1] > 0:
                            if MAP_ROOM_ID[ROOM2] < max_rooms and MAP_NAME[x][y] == "":
                                if MAP_ROOM[ROOM2][MAP_ROOM_ID[ROOM2]] != "":
                                    MAP_NAME[x][y] = MAP_ROOM[ROOM2][MAP_ROOM_ID[ROOM2]]
                            r = create_room(
                                zone, ROOM2, x * 8, 0, y * 8, MAP_NAME[x][y]
                            )
                            if rng.rand(2) == 1:
                                r.angle = 180
                            MAP_ROOM_ID[ROOM2] += 1
                        else:
                            if MAP_ROOM_ID[ROOM2C] < max_rooms and MAP_NAME[x][y] == "":
                                if MAP_ROOM[ROOM2C][MAP_ROOM_ID[ROOM2C]] != "":
                                    MAP_NAME[x][y] = MAP_ROOM[ROOM2C][
                                        MAP_ROOM_ID[ROOM2C]
                                    ]

                            if MAP_TEMP[x - 1][y] > 0 and MAP_TEMP[x][y + 1] > 0:
                                r = create_room(
                                    zone, ROOM2C, x * 8, 0, y * 8, MAP_NAME[x][y]
                                )
                                r.angle = 180
                            elif MAP_TEMP[x + 1][y] > 0 and MAP_TEMP[x][y + 1] > 0:
                                r = create_room(
                                    zone, ROOM2C, x * 8, 0, y * 8, MAP_NAME[x][y]
                                )
                                r.angle = 90
                            elif MAP_TEMP[x - 1][y] > 0 and MAP_TEMP[x][y - 1] > 0:
                                r = create_room(
                                    zone, ROOM2C, x * 8, 0, y * 8, MAP_NAME[x][y]
                                )
                                r.angle = 270
                            else:
                                r = create_room(
                                    zone, ROOM2C, x * 8, 0, y * 8, MAP_NAME[x][y]
                                )

                            MAP_ROOM_ID[ROOM2C] += 1
                    case 3:
                        if MAP_ROOM_ID[ROOM3] < max_rooms and MAP_NAME[x][y] == "":
                            if MAP_ROOM[ROOM3][MAP_ROOM_ID[ROOM3]] != "":
                                MAP_NAME[x][y] = MAP_ROOM[ROOM3][MAP_ROOM_ID[ROOM3]]

                        r = create_room(zone, ROOM3, x * 8, 0, y * 8, MAP_NAME[x][y])
                        if MAP_TEMP[x][y - 1] == 0:
                            r.angle = 180
                        elif MAP_TEMP[x - 1][y] == 0:
                            r.angle = 90
                        elif MAP_TEMP[x + 1][y] == 0:
                            r.angle = 270
                        MAP_ROOM_ID[ROOM3] = MAP_ROOM_ID[ROOM3] + 1
                    case 4:
                        if MAP_ROOM_ID[ROOM4] < max_rooms and MAP_NAME[x][y] == "":
                            if MAP_ROOM[ROOM4][MAP_ROOM_ID[ROOM4]] != "":
                                MAP_NAME[x][y] = MAP_ROOM[ROOM4][MAP_ROOM_ID[ROOM4]]

                        r = create_room(zone, ROOM4, x * 8, 0, y * 8, MAP_NAME[x][y])
                        MAP_ROOM_ID[ROOM4] += 1

    r = create_room(0, ROOM1, (MAP_WIDTH - 1) * 8, 500, 8, "gatea")
    MAP_ROOM_ID[ROOM1] += 1

    r = create_room(
        0, ROOM1, (MAP_WIDTH - 1) * 8, 0, (MAP_HEIGHT - 1) * 8, "pocketdimension"
    )
    MAP_ROOM_ID[ROOM1] += 1

    r = create_room(0, ROOM1, 8, 800, 0, "dimension1499")
    MAP_ROOM_ID[ROOM1] += 1

    for y in brange(0, MAP_HEIGHT):
        for x in brange(0, MAP_WIDTH):
            MAP_TEMP[x][y] = min(MAP_TEMP[x][y], 1)

    # normally we dont need the following door-spawning code,
    # but there are EXACTLY 2 `Rand` statements in the
    # loop that we DO need to execute
    for y in brange(MAP_HEIGHT, 0, -1):
        if y < i_zone.transition[1] - 1:
            zone = 3
        elif y >= i_zone.transition[1] - 1 and y < i_zone.transition[0] - 1:
            zone = 2
        else:
            zone = 1

        for x in brange(MAP_WIDTH, 0, -1):
            if MAP_TEMP[x][y] > 0:
                temp = 2 if zone == 2 else 0

                for r in ROOMS:
                    r.angle = wrap_angle(r.angle)
                    if int(r.x / 8.0) == x and int(r.z / 8.0) == y:
                        shouldSpawnDoor = False
                        match str_to_shape(
                            ROOM_TEMPLATES.get(r.template, {}).get("shape", "0")
                        ):
                            case 1:  # ROOM1
                                if r.angle == 90:
                                    shouldSpawnDoor = True
                            case 2:  # ROOM2
                                if r.angle == 90 or r.angle == 270:
                                    shouldSpawnDoor = True
                            case 3:  # ROOM2C
                                if r.angle == 0 or r.angle == 90:
                                    shouldSpawnDoor = True
                            case 4:  # ROOM3
                                if r.angle == 0 or r.angle == 180 or r.angle == 90:
                                    shouldSpawnDoor = True
                            case _:
                                shouldSpawnDoor = True

                        if shouldSpawnDoor:
                            if (x + 1) < (MAP_WIDTH + 1):
                                if MAP_TEMP[x + 1][y] > 0:
                                    rng.rand(-3, 1)
                                    # We dont care about creating the actual door.
                                    # We only advance the random seed by one.

                        shouldSpawnDoor = False
                        match str_to_shape(
                            ROOM_TEMPLATES.get(r.template, {}).get("shape", "0")
                        ):
                            case 1:  # ROOM1
                                if r.angle == 180:
                                    shouldSpawnDoor = True
                            case 2:  # ROOM2
                                if r.angle == 0 or r.angle == 180:
                                    shouldSpawnDoor = True
                            case 3:  # ROOM2C
                                if r.angle == 180 or r.angle == 90:
                                    shouldSpawnDoor = True
                            case 4:  # ROOM3
                                if r.angle == 180 or r.angle == 90 or r.angle == 270:
                                    shouldSpawnDoor = True
                            case _:
                                shouldSpawnDoor = True

                        if shouldSpawnDoor:
                            if (y + 1) < (MAP_HEIGHT + 1):
                                if MAP_TEMP[x][y + 1] > 0:
                                    rng.rand(-3, 1)
                                    # See comment above on creating door

    for r in ROOMS:
        r.angle = wrap_angle(r.angle)
        r.adjacent[0] = None
        r.adjacent[1] = None
        r.adjacent[2] = None
        r.adjacent[3] = None

        for r2 in ROOMS:
            if r != r2:
                if r2.z == r.z:
                    if (r2.x) == (r.x + 8.0):
                        r.adjacent[0] = r2
                    elif (r2.x) == (r.x - 8.0):
                        r.adjacent[2] = r2
                elif r2.x == r.x:
                    if (r2.z) == (r.z - 8.0):
                        r.adjacent[1] = r2
                    elif (r2.z) == (r.z + 8.0):
                        r.adjacent[3] = r2

            if (
                (r.adjacent[0] != None)
                and (r.adjacent[1] != None)
                and (r.adjacent[2] != None)
                and (r.adjacent[3] != None)
            ):
                break


create_map()

term = Terminal()
term.draw_rooms()

try:
    input()
except KeyboardInterrupt:
    pass

term.close()

exit()

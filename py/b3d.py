from constants import *


#
# Functions that emulate BlitzBasic behaviour
#


class Blitz3DRandom:
    """
    Function implementation based on:
    [blitz-research/blitz3d](https://github.com/blitz-research/blitz3d/blob/master/bbruntime/bbmath.cpp)
    """

    def __init__(self, seed: int):
        seed &= 0x7FFFFFFF
        self.seed = seed if seed else 1

    def _rnd(self):
        RND_A = 48271
        RND_M = 2147483647
        RND_Q = 44488
        RND_R = 3399

        self.seed = RND_A * (self.seed % RND_Q) - RND_R * (self.seed // RND_Q)
        if self.seed < 0:
            self.seed += RND_M
        return (self.seed & 65535) / 65536.0 + (0.5 / 65536.0)

    def rnd(self, start: float, end: float = 0) -> float:
        return self._rnd() * (end - start) + start

    def rand(self, start: int, end: int = 1) -> int:
        if end < start:
            t = start
            start = end
            end = t

        return int(self._rnd() * (end - start + 1)) + start


class Set:
    def __init__(self, state: list) -> None:
        self.state = state

    def __getitem__(self, key):
        return self.state[int(key)]

    def __setitem__(self, key, value):
        self.state[int(key)] = value

    def __str__(self) -> str:
        ret = []

        if isinstance(self.state[0], Set):
            for i in range(len(self.state)):
                ret.append(str(self.state[i]))
        else:
            ret.append(str(self.state))

        return "\n".join(ret)


def brange(x, y, s=1) -> range:
    return range(int(x), int(y + s), int(s))


#
# Types and global functions implemented by ScpCB
#


ROOMS: list["Rooms"] = []


class Rooms:
    def __init__(self, zone, shape, x, y, z) -> None:
        self.zone = zone
        self.shape = shape
        self.x = x
        self.y = y
        self.z = z
        self.template = ""
        self.angle = 0
        self.adjacent = [None for _ in range(4)]

        ROOMS.append(self)


class I_Zone:
    def __init__(
        self, transition: list, has_custom_forest: bool, has_custom_mt: bool
    ) -> None:
        self.transition = transition
        self.has_custom_forest = has_custom_forest
        self.has_custom_mt = has_custom_mt


def generate_seed_number(seed):
    temp = 0
    shift = 0
    for char in seed:
        temp ^= ord(char) << shift
        shift = (shift + 1) % 24
    return temp

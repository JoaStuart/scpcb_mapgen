import os
import sys
import time

from utils import *
from b3d import *
from constants import *


class Terminal:
    ROOM_CHARS = {
        0: {
            0: "!",
            90: "!",
            180: "!",
            270: "!",
        },
        1: {
            0: "╵",
            90: "╶",
            180: "╷",
            270: "╴",
        },
        2: {
            0: "┃",
            90: "━",
            180: "┃",
            270: "━",
        },
        3: {
            0: "┗",
            90: "┏",
            180: "┓",
            270: "┛",
        },
        4: {
            0: "┻",
            90: "┣",
            180: "┳",
            270: "┫",
        },
        5: {
            0: "╋",
            90: "╋",
            180: "╋",
            270: "╋",
        },
    }

    ZONES = [
        None,
        "[36m",
        "[31m",
        "[33m",
        None,
    ]

    def __init__(self):
        self.size = os.get_terminal_size()
        self.term = sys.stdout
        self.log = open("log.txt", "w", encoding="utf-8")

        self.send_esc_code(
            "[?1049h",
            "[0J",
            "[H",
            "[?25l",
            # f"[{self.size.lines - 1};{self.size.columns // 2}H",
        )

    def draw_rooms(self) -> None:
        for r in ROOMS:

            shape = str_to_shape(ROOM_TEMPLATES.get(r.template, {}).get("shape", "0"))

            tx = r.x / 8
            ty = r.z / 8

            if shape == None:
                shape = 0
                self.log.write(f"{tx} {ty} NO SHAPE")

            self.draw_marker(
                tx, ty, self.ROOM_CHARS[shape][r.angle], self.ZONES[r.zone]
            )

    def draw_marker(self, x: float, y: float, c: str, col: str | None) -> None:
        if x > self.size.columns - 1 or y > self.size.lines - 1:
            self.log.write(f"Out of console bounds: {c} at {x}, {y}\n")

        self.log.write(f"{x}, {y}\n")
        self.send_esc_code(f"[{int(y)};{int(x)}H")
        if col:
            self.send_esc_code(col)
        self.term.write(c)
        self.send_esc_code("[0m")
        self.term.flush()

    def send_esc_code(self, *code: str):
        for c in code:
            self.term.write(f"\033{c}")
            self.term.flush()

    def close(self):
        self.send_esc_code(
            "[?25h",
            "[?1049l",
        )

        self.log.flush()
        self.log.close()

from constants import LOGGER


def wrap_angle(angle: int) -> int:
    if angle < 0:
        return wrap_angle(360 + angle)
    elif angle > 359:
        return wrap_angle(angle - 360)
    else:
        return angle


SHAPES = {
    1: "1",
    2: "2",
    3: "2C",
    4: "3",
    5: "4",
}


def str_to_shape(name: str) -> int:
    for k, v in SHAPES.items():
        if v.lower() == name.lower():
            return k
    return None


def shape_to_str(shape: int) -> str:
    return SHAPES.get(shape)


def enable_win_ansi():
    import os

    if os.name == "nt":
        import ctypes

        kernel32 = ctypes.windll.kernel32

        if (
            kernel32.SetConsoleMode(
                kernel32.GetStdHandle(-11),
                0b111,
            )
            == 0
        ):
            LOGGER.error(f"SetConsoleMode error: {kernel32.GetLastError()}")
            exit(-1)

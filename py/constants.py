import logging

# Setup basic logger
logging.basicConfig(level=logging.DEBUG)
LOGGER = logging.getLogger()

from ini_reader import IniReader


ROOM_TEMPLATES = IniReader("data/rooms.ini")

ROOM_SCALE = 8.0 / 2048.0
ZONEAMOUNT = 3
MAP_WIDTH = 18  # Normally loaded from `options.ini`|>options|>map size
MAP_HEIGHT = 18  # Normally loaded from `options.ini`|>options|>map size

ROOM1 = 1
ROOM2 = 2
ROOM2C = 3
ROOM3 = 4
ROOM4 = 5

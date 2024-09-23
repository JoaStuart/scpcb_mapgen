from constants import LOGGER


class IniReader:
    def __init__(self, file_path: str) -> None:
        self.data: dict[str, dict[str, str]] = {}
        self._read_data(file_path)

    def _read_data(self, file_path: str) -> None:
        with open(file_path, "r") as ini:
            lines = ini.readlines()

        section = ""

        for full_line in lines:
            line = full_line.split(";", 1)[0].strip()  # Remove comments
            if len(line) == 0:
                continue

            if line[0] == "[" and line[-1] == "]":
                # new section
                section = line[1:-1]
                continue

            if "=" not in line:
                LOGGER.warning(f"Invalid line: {full_line}")

            key, value = line.split("=", 1)

            self.data[section] = self.data.get(section, {}) | {
                key.strip(): value.strip()
            }

    def get(self, key: str) -> dict[str, str]:
        return self.data.get(key)

    def get(self, key: str, default: dict[str, str]) -> dict[str, str]:
        return self.data.get(key, default)

    def __str__(self) -> str:
        return str(self.data)


if __name__ == "__main__":
    # Test out INI file reading
    reader = IniReader("data/rooms.ini")

    import json

    LOGGER.info(json.dumps(reader.data, indent=4))

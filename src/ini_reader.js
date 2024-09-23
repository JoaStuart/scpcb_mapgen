import { displaySeed } from "./script.js";

class IniReader {
  data;

  /**
   * @param {string} file_path
   */
  constructor(file_path) {
    this.data = {};
    this.#_readData(file_path);
  }

  #_readData(file_path) {
    fetch(file_path)
      .then((res) => res.text())
      .then((text) => {
        let lines = text.split("\n").map((line) => line.trim());

        let section = "";
        for (let full_line of lines) {
          let line = full_line.split(";", 1)[0].trim(); // Remove comments
          if (line.length == 0) continue;

          if (line[0] == "[" && line[line.length - 1] == "]") {
            section = line.substring(1, line.length - 1);
            continue;
          }

          if (line.indexOf("=") == -1) {
            console.warn(`Invalid line: ${full_line}`);
            continue;
          }
          let [key, value] = line.split("=", 2);
          this.data[section] = this.data[section] || {};
          this.data[section][key.trim()] = value.trim();
        }
        displaySeed();
      });
  }

  get(key) {
    return this.data[key];
  }

  get(key, default_value) {
    return this.data[key] ?? default_value;
  }
}

export { IniReader };

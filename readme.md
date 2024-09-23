# SCP CB Map Generator

## What is this?

This project aims to emulate the random map generation algorithm from [SCP Containment Breach](https://www.scpcbgame.com) for generating real-time map previews in any modern browser.

Started to annoy [scpWyatt](https://www.youtube.com/@scpWyatt) who took a whole day to make a spreadsheet for one seed by hand with basically the same information.

<small>Don't spend one day doing something when you can spend ten days automating it.</small>

## Bugs

There are propably a lot.

If you find any, open an issue. (Or just fix it yourself. Makes my job over here easier.)

### Known Bugs

- SCP BC does not use `disabledecals` to stop 106's spawn timer
- The map grid is sometimes slightly misaligned (because of rotation + grid-gap imperfections)
- In the Python implementation the map is flipped

## ToDo

<small>Basically everything I am to lazy to do now...</small>

|      Function |     | Source             | Description                |
| ------------: | --- | :----------------- | -------------------------- |
|      FillRoom | @   | MapSystem.bb::2102 | Create items for each room |
| GenForestGrid | @   | MapSystem.bb::877  | Generate forest            |

## Cool People

[**Regalis11**](https://www.youtube.com/@scpWyatt) - for creating and releasing the source code of [SCP CB](https://github.com/Regalis11/scpcb). Without the source code this project might have been impossible 🤷‍♂️

[**Mark Sibly**](https://github.com/blitz-research) - for creating an [open-source release](https://github.com/blitz-research/blitz3d) of Blitz3D (the game engine used for CB). This was the final piece of the puzzle, mostly because Blitz3D has been deprecated for a good while and no good in-depth documentation is available online.

## Licence

This project is licensed under Creative Commons Attribution-ShareAlike 3.0 License.

http://creativecommons.org/licenses/by-sa/3.0/

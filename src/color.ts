import { Vector3 } from "./geometry/vector";

abstract class Color {
  static get black() {
    return new Vector3(0, 0, 0);
  }

  static get red() {
    return new Vector3(1, 0, 0);
  }

  static get green() {
    return new Vector3(0, 1, 0);
  }

  static get blue() {
    return new Vector3(0, 0, 1);
  }

  static get white() {
    return new Vector3(1, 1, 1);
  }

  static rgb(r: number, g: number, b: number) {
    return new Vector3(r / 255, g / 255, b / 255);
  }
}

export { Color };

import { Vector2 } from "./vector";

class Transform {
  constructor(
    private _position: Vector2,
    private _rotation: number,
    private _scale: number
  ) {}

  static get origin(): Transform {
    return new Transform(Vector2.zero, 0, 1);
  }

  get position(): Vector2 {
    return this._position;
  }

  get rotation(): number {
    return this._rotation;
  }

  get scale(): number {
    return this._scale;
  }

  set position(value: Vector2) {
    this._position = value;
  }

  set rotation(value: number) {
    this._rotation = value;
  }

  set scale(value: number) {
    this._scale = value;
  }
}

export { Transform };

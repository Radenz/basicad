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

  serialize(): TransformData {
    return {
      position: this.position.serialize(),
      rotation: this.rotation,
      scale: this.scale,
    };
  }

  static deserialize(data: TransformData): Transform {
    const { position, rotation, scale } = data;
    return new Transform(Vector2.deserialize(position), rotation, scale);
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

  set x(value: number) {
    this._position.x = value;
  }

  set y(value: number) {
    this._position.y = value;
  }

  set rotation(value: number) {
    this._rotation = value;
  }

  set scale(value: number) {
    this._scale = value;
  }

  clone(): Transform {
    return new Transform(this._position.clone(), this._rotation, this._scale);
  }
}

interface TransformData {
  position: number[];
  rotation: number;
  scale: number;
}

export { Transform, TransformData };

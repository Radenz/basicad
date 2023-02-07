import { Nullable } from "../util";

class Vector2 {
  static Q1 = new Vector2(1, 1);
  static Q2 = new Vector2(-1, 1);
  static Q3 = new Vector2(-1, -1);
  static Q4 = new Vector2(1, -1);

  public onChange: Nullable<(newValue: Vector2) => void> = null;

  constructor(private _x: number, private _y: number) {}

  static get zero() {
    return new Vector2(0, 0);
  }

  static multiplyEach(a: Vector2, b: Vector2) {
    return new Vector2(a.x * b.x, a.y * b.y);
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get data(): number[] {
    return [this._x, this._y];
  }

  set x(value: number) {
    this._x = value;
    if (this.onChange) this.onChange(this);
  }

  set y(value: number) {
    this._y = value;
    if (this.onChange) this.onChange(this);
  }

  set(other: Vector2) {
    this._x = other.x;
    this._y = other.y;
  }

  clone(): Vector2 {
    return new Vector2(this._x, this._y);
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this._x + other._x, this._y + other._y);
  }

  sub(other: Vector2): Vector2 {
    return new Vector2(this._x - other._x, this._y - other._y);
  }

  rotate(angle: number, origin: Vector2) {
    const diff = this.sub(origin);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const newX = c * diff.x - s * diff.y;
    const newY = s * diff.x + c * diff.y;
    this._x = origin.x + newX;
    this._y = origin.y + newY;
  }

  scale(factor: number) {
    this._x *= factor;
    this._y *= factor;
  }

  scaleX(factor: number) {
    this._x *= factor;
  }

  scaleY(factor: number) {
    this._y *= factor;
  }
}

class Vector3 {
  static get zero() {
    return new Vector3(0, 0, 0);
  }

  constructor(private _x: number, private _y: number, private _z: number) {}

  get data(): number[] {
    return [this._x, this._y, this._z];
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get z(): number {
    return this._z;
  }
}

export { Vector2, Vector3 };

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

  static squaredDistance(a: Vector2, b: Vector2): number {
    return Math.pow(a._x - b._x, 2) + Math.pow(a._y - b._y, 2);
  }

  static distance(a: Vector2, b: Vector2): number {
    return Math.sqrt(Vector2.squaredDistance(a, b));
  }

  static between(vec: Vector2, bound1: Vector2, bound2: Vector2): boolean {
    if (
      vec.x >= bound1.x &&
      vec.x <= bound2.x &&
      vec.y >= bound1.y &&
      vec.y <= bound2.y
    )
      return true;

    if (
      vec.x >= bound2.x &&
      vec.x <= bound1.x &&
      vec.y >= bound2.y &&
      vec.y <= bound1.y
    )
      return true;

    return false;
  }

  static mix(a: Vector2, b: Vector2, factor: number): Vector2 {
    if (factor < 0) factor = 0;
    if (factor > 1) factor = 1;
    return new Vector2(
      a.x * factor + b.x * (1 - factor),
      a.y * factor + b.y * (1 - factor)
    );
  }

  // Refer to:
  // https://stackoverflow.com/questions/40410743/polygon-triangulation-reflex-vertex
  static det(a: Vector2, b: Vector2): number {
    return a.x * b.y - b.x * a.y;
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

  get magnitude(): number {
    return Math.sqrt(this._x * this._x + this._y * this._y);
  }

  get slope() {
    return this._y / this._x;
  }

  set x(value: number) {
    this._x = value;
    if (this.onChange) this.onChange(this);
  }

  set y(value: number) {
    this._y = value;
    if (this.onChange) this.onChange(this);
  }

  equals(other: Vector2): boolean {
    return this._x === other._x && this._y == other._y;
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

  arc(): number {
    return Math.atan2(this._y, this._x);
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

  distanceTo(line: [Vector2, Vector2]): number {
    const p0 = this;
    const p1 = line[0];
    const p2 = line[1];

    const direction = p2.sub(p1);
    const denom = direction.magnitude;

    let inBound =
      p1.y == p2.y
        ? between(p0.x, p1.x, p2.x)
        : (() => {
            const crossSlope = Math.tan(direction.arc() + Math.PI / 2);

            const offset1 = p1.y - crossSlope * p1.x;
            const offset2 = p2.y - crossSlope * p2.x;

            const yBound1 = crossSlope * p0.x + offset1;
            const yBound2 = crossSlope * p0.x + offset2;

            return between(p0.y, yBound1, yBound2);
          })();

    if (!inBound)
      return Math.min(Vector2.distance(p0, p1), Vector2.distance(p0, p2));

    const num = Math.abs(
      (p2.x - p1.x) * (p1.y - p0.y) - (p1.x - p0.x) * (p2.y - p1.y)
    );
    return num / denom;
  }
}

function between(a: number, bound1: number, bound2: number): boolean {
  return (bound1 <= a && a <= bound2) || (bound2 <= a && a <= bound1);
}

class Vector3 {
  static get zero() {
    return new Vector3(0, 0, 0);
  }

  constructor(private _x: number, private _y: number, private _z: number) {}

  static mix(a: Vector3, b: Vector3, factor: number): Vector3 {
    if (factor < 0) factor = 0;
    if (factor > 1) factor = 1;
    return new Vector3(
      a.x * factor + b.x * (1 - factor),
      a.y * factor + b.y * (1 - factor),
      a.z * factor + b.z * (1 - factor)
    );
  }

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

  clone(): Vector3 {
    return new Vector3(this._x, this._y, this._z);
  }
}

export { Vector2, Vector3 };

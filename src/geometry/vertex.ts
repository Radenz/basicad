import { Shape } from "../shape/shape";
import { Transform } from "./transform";
import { Nullable } from "../util";
import { Vector2, Vector3 } from "./vector";

class Vertex {
  private parent: Nullable<Shape> = null;
  public onChange: Nullable<(value: Vertex) => void> = null;

  constructor(readonly position: Vector2, private _color: Vector3) {
    this.position.onChange = () => {
      if (this.onChange) this.onChange(this);
    };
  }

  origin() {
    return new Vertex(Vector2.zero, Vector3.zero);
  }

  get parentTransform(): Transform {
    return this.parent ? this.parent.transform : Transform.origin;
  }

  get color(): Vector3 {
    return this._color;
  }

  get globalCoord(): Vector2 {
    const coord = this.position.clone();
    const scale = this.parent?.transform.scale ?? 1;
    const rotation = this.parent?.transform.rotation ?? 0;
    const translation = this.parent?.transform.position ?? Vector2.zero;
    coord.scale(scale);
    coord.rotate(rotation, Vector2.zero);
    return coord.add(translation);
  }

  set globalCoord(coord: Vector2) {
    const scale = this.parent?.transform.scale ?? 1;
    const rotation = this.parent?.transform.rotation ?? 0;
    const translation = this.parent?.transform.position ?? Vector2.zero;
    const localCoord = coord.sub(translation);
    localCoord.rotate(-rotation, Vector2.zero);
    localCoord.scale(1 / scale);
    this.position.x = localCoord.x;
    this.position.y = localCoord.y;
  }

  set color(value: Vector3) {
    this._color = value;
    if (this.onChange) this.onChange(this);
  }

  get data(): number[] {
    const data = [
      this.position.data,
      this.color.data,
      this.parentTransform.position.data,
      this.parentTransform.rotation,
      this.parentTransform.scale,
    ];
    return data.flat();
  }

  distanceTo(line: [Vertex, Vertex]): number {
    const p0 = this.position;
    const p1 = line[0].position;
    const p2 = line[1].position;
    const denom = p2.sub(p1).magnitude;
    const num = Math.abs(
      (p2.x - p1.x) * (p1.y - p0.y) - (p1.x - p0.x) * (p2.y - p1.y)
    );
    return num / denom;
  }

  bind(parent: Shape) {
    this.parent = parent;
  }

  clone(): Vertex {
    return new Vertex(this.position.clone(), this.color.clone());
  }

  rotate(angle: number) {
    const origin = this.parentTransform.position;
    this.position.rotate(angle, origin);
  }

  scale(factor: number) {
    this.position.scale(factor);
  }

  scaleX(factor: number) {
    this.position.scaleX(factor);
  }

  scaleY(factor: number) {
    this.position.scaleY(factor);
  }
}

export { Vertex };

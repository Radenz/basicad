import { Shape } from "../shape/shape";
import { Transform } from "./transform";
import { Nullable } from "../util";
import { Vector2, Vector3 } from "./vector";

class Vertex {
  private parent: Nullable<Shape> = null;
  public onChange: Nullable<(value: Vertex) => void> = null;

  constructor(readonly position: Vector2, public color: Vector3) {
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

  bind(parent: Shape) {
    this.parent = parent;
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

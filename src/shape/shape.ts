import { Transform, TransformData } from "../geometry/transform";
import { Vector2, Vector3 } from "../geometry/vector";
import { Vertex, VertexData } from "../geometry/vertex";

abstract class Shape {
  protected _vertices: Vertex[] = [];
  protected highlight: boolean = false;
  protected hidden: boolean = false;
  constructing = false;

  protected dataCache: number[] = [];
  protected needUpdate: boolean = false;

  readonly transform: Transform;

  constructor(_transform: Transform) {
    const shape = this;
    this.transform = new Proxy(_transform, {
      set(target, p, receiver) {
        Reflect.set(target, p, receiver);
        shape.needUpdate = true;
        return true;
      },
    });
  }

  abstract drawMode(context: WebGLRenderingContext): number;

  abstract isInsideClickArea(point: Vector2): boolean;

  abstract type(): string;

  serialize(): ShapeData {
    const name = this.name;
    const type = this.type();
    const vertices = this._vertices.map((vertex) => vertex.serialize());

    return {
      name,
      type,
      transform: this.transform.serialize(),
      vertices,
    };
  }

  get data(): number[] {
    if (this.needUpdate)
      this.dataCache = this._vertices.map((v) => v.data).flat();
    this.needUpdate = false;
    return this.dataCache;
  }

  get name(): string {
    return "Shape";
  }

  get isHighlighted(): boolean {
    return this.highlight;
  }

  get isHidden(): boolean {
    return this.hidden;
  }

  get willUpdate(): boolean {
    return this.needUpdate;
  }

  get vertices(): Vertex[] {
    return this._vertices;
  }

  get vertexCount(): number {
    return this._vertices.length;
  }

  get center(): Vector2 {
    if (this._vertices.length === 0) return Vector2.zero;
    let sum = Vector2.zero;

    this._vertices.forEach((v) => (sum = sum.add(v.position)));
    sum.scale(1 / this._vertices.length);
    return sum;
  }

  set isHighlighted(value: boolean) {
    this.highlight = value;
  }

  set isHidden(value: boolean) {
    this.hidden = value;
  }

  update() {
    this.needUpdate = true;
  }

  setVerticesColor(color: Vector3) {
    this._vertices.forEach((vertex) => {
      vertex.color = color.clone();
    });
    this.needUpdate = true;
  }

  rotate(angle: number) {
    this.transform.rotation += angle;
    this.needUpdate = true;
  }

  translate(distance: Vector2) {
    this.transalteX(distance.x);
    this.transalteY(distance.y);
    this.needUpdate = true;
  }

  transalteX(distance: number) {
    this.transform.position.x += distance;
    this.needUpdate = true;
  }

  transalteY(distance: number) {
    this.transform.position.y += distance;
    this.needUpdate = true;
  }

  scale(factor: number) {
    this.transform.scale *= factor;
    this.needUpdate = true;
  }
}

interface ShapeData {
  name: string;
  type: string;
  transform: TransformData;
  vertices: VertexData[];
}

export { Shape, ShapeData };

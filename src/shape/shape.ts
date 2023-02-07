import { Transform } from "../geometry/transform";
import { Vector2 } from "../geometry/vector";
import { Vertex } from "../geometry/vertex";

abstract class Shape {
  protected _vertices: Vertex[] = [];
  protected highlight: boolean = false;
  protected hidden: boolean = false;

  constructor(readonly transform: Transform) {}

  abstract drawMode(context: WebGLRenderingContext): number;

  get data(): number[] {
    return this._vertices.map((v) => v.data).flat();
  }

  get isHighlighted(): boolean {
    return this.highlight;
  }

  get isHidden(): boolean {
    return this.hidden;
  }

  get vertices(): Vertex[] {
    return this._vertices;
  }

  get vertexCount(): number {
    return this._vertices.length;
  }

  set isHighlighted(value: boolean) {
    this.highlight = value;
  }

  set isHidden(value: boolean) {
    this.hidden = value;
  }

  rotate(angle: number) {
    this.transform.rotation += angle;
  }

  translate(distance: Vector2) {
    this.transalteX(distance.x);
    this.transalteY(distance.y);
  }

  transalteX(distance: number) {
    this.transform.position.x += distance;
  }

  transalteY(distance: number) {
    this.transform.position.y += distance;
  }

  scale(factor: number) {
    this.transform.scale *= factor;
  }
}

export { Shape };

import { Transform } from "../geometry/transform";
import { Vector2 } from "../geometry/vector";
import { Vertex } from "../geometry/vertex";

abstract class Shape {
  protected _vertices: Vertex[] = [];
  protected highlight: boolean = false;
  protected hidden: boolean = false;

  protected dataCache: number[] = [];
  protected needUpdate: boolean = false;

  constructor(readonly transform: Transform) {}

  abstract drawMode(context: WebGLRenderingContext): number;

  get data(): number[] {
    if (this.needUpdate)
      this.dataCache = this._vertices.map((v) => v.data).flat();
    this.needUpdate = false;
    return this.dataCache;
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

export { Shape };

import { Transform } from "../geometry/transform";
import { Vector2 } from "../geometry/vector";
import { Vertex } from "../geometry/vertex";
import { DEFAULT_SHAPE_COLOR } from "../util";
import { Shape } from "./shape";

class Square extends Shape {
  private firstCornerPosition: Vector2 = null;

  constructor(transform: Transform, private _size: number) {
    super(transform);
    this.initVertices();
    this.needUpdate = true;
  }

  static fromCorner(position: Vector2): Square {
    const square = new Square(new Transform(position.clone(), 0, 1), 0);
    square.firstCornerPosition = position.clone();
    square.constructing = true;
    return square;
  }

  setNextCorner(position: Vector2) {
    if (!this.constructing) return;

    const middle = Vector2.mix(this.firstCornerPosition, position, 0.5);
    this.transform.x = middle.x;
    this.transform.y = middle.y;
    const relativeFirstCorner = middle.sub(this.firstCornerPosition);
    this._vertices[0].position.x = relativeFirstCorner.x;
    this._vertices[0].position.y = relativeFirstCorner.y;
    this.needUpdate = true;
  }

  finalize() {
    this.constructing = false;
    this.firstCornerPosition = null;
  }

  initVertices() {
    // const halfDiag = (this._size / 2) * Math.SQRT2;
    const s = this._size / 2;
    const topRight = new Vertex(new Vector2(s, s), DEFAULT_SHAPE_COLOR);
    const topLeft = new Vertex(new Vector2(-s, s), DEFAULT_SHAPE_COLOR);
    const bottomLeft = new Vertex(new Vector2(-s, -s), DEFAULT_SHAPE_COLOR);
    const bottomRight = new Vertex(new Vector2(s, -s), DEFAULT_SHAPE_COLOR);

    this._vertices = [topRight, topLeft, bottomLeft, bottomRight];
    this._vertices.forEach((v) => {
      v.bind(this);
      v.onChange = (vertex) => this.onVertexChanged(vertex);
    });
  }

  onVertexChanged(vertex: Vertex) {
    let index = this._vertices.indexOf(vertex);
    let position = vertex.position.clone();
    this._size = position.magnitude * Math.SQRT2;
    for (let i = 1; i < 4; i++) {
      const vertexIndex = (index + i) % 4;
      const vertex = this._vertices[vertexIndex];
      position.rotate(Math.PI / 2, Vector2.zero);

      // ? Nullify change listener so change listeners loop doesn't occur
      vertex.position.set(position);
    }
    this.needUpdate = true;
  }

  override drawMode(context: WebGLRenderingContext) {
    return context.TRIANGLE_FAN;
  }

  get name(): string {
    return "Square";
  }

  get size(): number {
    return this._size;
  }

  set size(value: number) {
    const factor = value / this._size;
    this._vertices.forEach((v) => v.scale(factor));
    this._size = value;
    this.needUpdate = true;
  }
}

export { Square };

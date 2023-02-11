import { Color } from "../color";
import { Shape } from "./shape";
import { Transform } from "../geometry/transform";
import { Vector2 } from "../geometry/vector";
import { Vertex } from "../geometry/vertex";

// TODO: handle on vertex change
class Line extends Shape {
  constructor(transform: Transform, private _length: number) {
    super(transform);
    this.initVertices();
    this.needUpdate = true;
  }

  initVertices() {
    const halfDiag = (this._length / 2) * Math.SQRT2;
    const vertexA = new Vertex(new Vector2(-halfDiag, -halfDiag), Color.black);
    const vertexB = new Vertex(new Vector2(halfDiag, halfDiag), Color.black);
    this._vertices = [vertexA, vertexB];
    this._vertices.forEach((v) => {
      v.bind(this);
      v.onChange = (vertex) => this.onVertexChanged(vertex);
    });
  }

  get length() {
    return this._length;
  }

  set length(value) {
    const factor = value / this._length;
    this._vertices.forEach((v) => v.scale(factor));
    this._length = value;
    this.needUpdate = true;
  }

  onVertexChanged(_: Vertex) {
    const vertex1 = this._vertices[0];
    const vertex2 = this._vertices[1];
    this._length = Vector2.distance(vertex1.position, vertex2.position);
    this.needUpdate = true;
  }

  override drawMode(context: WebGLRenderingContext) {
    return context.LINE_STRIP;
  }
}

export { Line };

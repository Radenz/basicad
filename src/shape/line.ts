import { Color } from "../color";
import { Shape } from "./shape";
import { Transform } from "../geometry/transform";
import { Vector2 } from "../geometry/vector";
import { Vertex } from "../geometry/vertex";

class Line extends Shape {
  constructor(transform: Transform, private _length: number) {
    super(transform);
    this.initVertices();
  }

  initVertices() {
    const halfDiag = (this._length / 2) * Math.SQRT2;
    const vertexA = new Vertex(new Vector2(-halfDiag, -halfDiag), Color.black);
    const vertexB = new Vertex(new Vector2(halfDiag, halfDiag), Color.black);
    this._vertices = [vertexA, vertexB];
    this._vertices.forEach((v) => {
      v.bind(this);
    });
  }

  get length() {
    return this._length;
  }

  set length(value) {
    const factor = value / this._length;
    this._vertices.forEach((v) => v.scale(factor));
    this._length = value;
  }

  override drawMode(context: WebGLRenderingContext) {
    return context.LINE_STRIP;
  }
}

export { Line };

import { Color } from "../color";
import { Transform } from "../geometry/transform";
import { Vector2 } from "../geometry/vector";
import { Vertex } from "../geometry/vertex";
import { Shape } from "./shape";

class Square extends Shape {
  constructor(transform: Transform, private _size: number) {
    super(transform);
    this.initVertices();
  }

  initVertices() {
    // const halfDiag = (this._size / 2) * Math.SQRT2;
    const s = this._size / 2;
    const topRight = new Vertex(new Vector2(s, s), Color.black);
    const topLeft = new Vertex(new Vector2(-s, s), Color.black);
    const bottomLeft = new Vertex(new Vector2(-s, -s), Color.black);
    const bottomRight = new Vertex(new Vector2(s, -s), Color.black);

    this._vertices = [topRight, topLeft, bottomLeft, bottomRight];
    this._vertices.forEach((v) => {
      v.bind(this);
      v.onChange = (vertex) => this.onVertexChanged(vertex);
    });
  }

  onVertexChanged(vertex: Vertex) {
    let index = this._vertices.indexOf(vertex);
    let position = vertex.position.clone();
    for (let i = 1; i < 4; i++) {
      const vertexIndex = (index + i) % 4;
      const vertex = this._vertices[vertexIndex];
      position.rotate(Math.PI / 2, Vector2.zero);

      // ? Nullify change listener so change listeners loop doesn't occur
      vertex.position.set(position);
    }
  }

  override drawMode(context: WebGLRenderingContext) {
    return context.TRIANGLE_FAN;
  }

  get size(): number {
    return this._size;
  }

  set size(value: number) {
    const factor = value / this._size;
    this._vertices.forEach((v) => v.scale(factor));
    this._size = value;
  }
}

export { Square };

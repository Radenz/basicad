import { Color } from "../color";
import { Transform } from "../geometry/transform";
import { Vector2 } from "../geometry/vector";
import { Vertex } from "../geometry/vertex";
import { Shape } from "./shape";

type Quadrant = 0 | 1 | 2 | 3;

class Rectangle extends Shape {
  static getMultiplier(index: Quadrant) {
    switch (index) {
      case 0:
        return Vector2.Q1;
      case 1:
        return Vector2.Q2;
      case 2:
        return Vector2.Q3;
      case 3:
        return Vector2.Q4;
    }
  }

  constructor(
    transform: Transform,
    private _length: number,
    private _width: number
  ) {
    super(transform);
    this.initVertices();
    this.needUpdate = true;
  }

  initVertices() {
    const l = this._length / 2;
    const w = this._width / 2;
    const topRight = new Vertex(new Vector2(l, w), Color.black);
    const topLeft = new Vertex(new Vector2(-l, w), Color.black);
    const bottomLeft = new Vertex(new Vector2(-l, -w), Color.black);
    const bottomRight = new Vertex(new Vector2(l, -w), Color.black);

    this._vertices = [topRight, topLeft, bottomLeft, bottomRight];
    this._vertices.forEach((v) => {
      v.bind(this);
      v.onChange = (vertex) => this.onVertexChanged(vertex);
    });
  }

  set length(value: number) {
    const factor = value / this._length;
    this._vertices.forEach((v) => v.scaleX(factor));
    this._length = value;
    this.needUpdate = true;
  }

  set width(value: number) {
    const factor = value / this._width;
    this._vertices.forEach((v) => v.scaleY(factor));
    this._width = value;
    this.needUpdate = true;
  }

  onVertexChanged(vertex: Vertex) {
    let index = this._vertices.indexOf(vertex);
    let inverter = Rectangle.getMultiplier(index as Quadrant);
    const topRightVertex = this._vertices[0];

    topRightVertex.position.set(
      Vector2.multiplyEach(vertex.position, inverter)
    );

    for (let i = 1; i < 4; i++) {
      const vertex = this._vertices[i];
      let converter = Rectangle.getMultiplier(i as Quadrant);
      vertex.position.set(
        Vector2.multiplyEach(topRightVertex.position, converter)
      );
    }

    this._length = Math.abs(topRightVertex.position.x * 2);
    this._width = Math.abs(topRightVertex.position.y * 2);
    this.needUpdate = true;
  }

  drawMode(context: WebGLRenderingContext) {
    return context.TRIANGLE_FAN;
  }
}

export { Rectangle };

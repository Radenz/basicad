import { Transform } from "../geometry/transform";
import { Vector2 } from "../geometry/vector";
import { Vertex } from "../geometry/vertex";
import { DEFAULT_SHAPE_COLOR } from "../util";
import { Shape } from "./shape";

type Quadrant = 0 | 1 | 2 | 3;

class Rectangle extends Shape {
  private firstCornerPosition: Vector2 = null;

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

  static fromCorner(position: Vector2): Rectangle {
    const rectangle = new Rectangle(
      new Transform(position.clone(), 0, 1),
      0,
      0
    );
    rectangle.firstCornerPosition = position.clone();
    rectangle.constructing = true;
    return rectangle;
  }

  setNextCorner(position: Vector2) {
    if (!this.constructing) return;

    const middle = Vector2.mix(this.firstCornerPosition, position, 0.5);
    this.transform.x = middle.x;
    this.transform.y = middle.y;
    const relativeFirstCorner = middle.sub(this.firstCornerPosition);
    this._vertices[0].position.x = relativeFirstCorner.x;
    this._vertices[0].position.y = relativeFirstCorner.y;
    this._vertices[2].position.x = -relativeFirstCorner.x;
    this._vertices[2].position.y = -relativeFirstCorner.y;
    this.needUpdate = true;
  }

  finalize() {
    this.constructing = false;
    this.firstCornerPosition = null;
  }

  initVertices() {
    const l = this._length / 2;
    const w = this._width / 2;
    const topRight = new Vertex(new Vector2(l, w), DEFAULT_SHAPE_COLOR);
    const topLeft = new Vertex(new Vector2(-l, w), DEFAULT_SHAPE_COLOR);
    const bottomLeft = new Vertex(new Vector2(-l, -w), DEFAULT_SHAPE_COLOR);
    const bottomRight = new Vertex(new Vector2(l, -w), DEFAULT_SHAPE_COLOR);

    this._vertices = [topRight, topLeft, bottomLeft, bottomRight];
    this._vertices.forEach((v) => {
      v.bind(this);
      v.onChange = (vertex) => this.onVertexChanged(vertex);
    });
  }

  get name() {
    return "Rectangle";
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
    const invertedQuadrant =
      topRightVertex.position.x * topRightVertex.position.y < 0;

    for (let i = 1; i < 4; i++) {
      const vertex = this._vertices[i];
      let converter = Rectangle.getMultiplier(i as Quadrant);
      if (invertedQuadrant && i % 2 == 1) {
        converter = converter.clone();
        converter.scale(-1);
      }

      vertex.position.set(
        Vector2.multiplyEach(topRightVertex.position, converter)
      );
    }

    this._length = Math.abs(topRightVertex.position.x * 2);
    this._width = Math.abs(topRightVertex.position.y * 2);
    this.needUpdate = true;
  }

  override drawMode(context: WebGLRenderingContext) {
    return context.TRIANGLE_FAN;
  }

  override isInsideClickArea(point: Vector2): boolean {
    const vertex1 = this.vertices[0];
    const vertex3 = this.vertices[2];
    return Vector2.between(point, vertex1.globalCoord, vertex3.globalCoord);
  }
}

export { Rectangle };

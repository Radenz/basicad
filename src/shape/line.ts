import { Shape, ShapeData } from "./shape";
import { Transform } from "../geometry/transform";
import { Vector2, Vector3 } from "../geometry/vector";
import { Vertex } from "../geometry/vertex";
import { DEFAULT_SHAPE_COLOR, LINE_CLICK_RANGE } from "../util";

class Line extends Shape {
  private firstPoint: Vector2 = null;

  constructor(transform: Transform, private _length: number) {
    super(transform);
    this.initVertices();
    this.name = "Line";
    this.needUpdate = true;
  }

  static deserialize(data: ShapeData): Line {
    const transform = Transform.deserialize(data.transform);
    const { vertices } = data;
    const vertex1Pos = Vector2.deserialize(vertices[0].position);
    const vertex2Pos = Vector2.deserialize(vertices[1].position);
    const vertex1Color = Vector3.deserialize(vertices[0].color);
    const vertex2Color = Vector3.deserialize(vertices[1].color);
    const line = Line.fromStart(vertex1Pos);
    line.setNextPoint(vertex2Pos);
    line.finalize();
    line.vertices[0].color = vertex1Color;
    line.vertices[1].color = vertex2Color;
    line.translate(transform.position);
    line.rotate(transform.rotation);
    line.scale(transform.scale);

    return line;
  }

  static fromStart(position: Vector2): Line {
    const line = new Line(new Transform(position.clone(), 0, 1), 0);
    line.constructing = true;
    line.firstPoint = position.clone();
    return line;
  }

  setNextPoint(position: Vector2) {
    if (!this.constructing) return;

    const middle = Vector2.mix(this.firstPoint, position, 0.5);
    this.transform.x = middle.x;
    this.transform.y = middle.y;
    const relativeFirstPoint = middle.sub(this.firstPoint);
    this._vertices[0].position.x = relativeFirstPoint.x;
    this._vertices[0].position.y = relativeFirstPoint.y;
    this._vertices[1].position.x = -relativeFirstPoint.x;
    this._vertices[1].position.y = -relativeFirstPoint.y;
    this.needUpdate = true;
  }

  finalize() {
    this.constructing = false;
    this.firstPoint = null;
  }

  initVertices() {
    const halfDiag = (this._length / 2) * Math.SQRT2;
    const vertexA = new Vertex(
      new Vector2(-halfDiag, -halfDiag),
      DEFAULT_SHAPE_COLOR
    );
    const vertexB = new Vertex(
      new Vector2(halfDiag, halfDiag),
      DEFAULT_SHAPE_COLOR
    );
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

  override isInsideClickArea(point: Vector2): boolean {
    const vertex1 = this._vertices[0];
    const vertex2 = this._vertices[1];
    return (
      point.distanceTo([vertex1.globalCoord, vertex2.globalCoord]) <=
      LINE_CLICK_RANGE
    );
  }

  override type(): string {
    return "line";
  }
}

export { Line };

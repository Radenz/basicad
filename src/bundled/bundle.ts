type Nullable<T> = T | null;
type Listener<T> = (object: T) => any;

// * Parameterized constants
const FPS = 60;

const POINT_RADIUS = 0.005;
const ORIGIN_CURSOR_RADIUS = 0.01;
const LINE_CLICK_RANGE = 0.02;

const FLOAT_SIZE = 4;

const POSITION_SIZE = 2;
const COLOR_SIZE = 3;

// * Derived constants
// !! DO NOT CHANGE
const FACTOR_SIZE = 1;
const PARENT_POSITION_INDEX = POSITION_SIZE + COLOR_SIZE;
const PARENT_ROTATION_INDEX = POSITION_SIZE + COLOR_SIZE + POSITION_SIZE;
const PARENT_SCALE_INDEX =
  POSITION_SIZE + COLOR_SIZE + POSITION_SIZE + FACTOR_SIZE;
const VERTEX_SIZE =
  POSITION_SIZE + COLOR_SIZE + POSITION_SIZE + FACTOR_SIZE + FACTOR_SIZE;
const R = POSITION_SIZE + 0;
const G = POSITION_SIZE + 1;
const B = POSITION_SIZE + 2;
const FRAME_DELTA_TIME = 1000 / FPS;

const onNextFrame =
  window.requestAnimationFrame.bind(window) ||
  window["webkitRequestAnimationFrame"].bind(window) ||
  window["mozRequestAnimationFrame"].bind(window) ||
  window["oRequestAnimationFrame"].bind(window) ||
  window["msRequestAnimationFrame"].bind(window) ||
  function (callback: () => any) {
    window.setTimeout(callback, FRAME_DELTA_TIME);
  };

class Vector2 {
  static Q1 = new Vector2(1, 1);
  static Q2 = new Vector2(-1, 1);
  static Q3 = new Vector2(-1, -1);
  static Q4 = new Vector2(1, -1);

  public onChange: Nullable<(newValue: Vector2) => void> = null;

  constructor(private _x: number, private _y: number) {}

  serialize(): [number, number] {
    return [this._x, this._y];
  }

  static deserialize(data: number[]): Vector2 {
    return new Vector2(data[0], data[1]);
  }

  static get zero() {
    return new Vector2(0, 0);
  }

  static multiplyEach(a: Vector2, b: Vector2) {
    return new Vector2(a.x * b.x, a.y * b.y);
  }

  static squaredDistance(a: Vector2, b: Vector2): number {
    return Math.pow(a._x - b._x, 2) + Math.pow(a._y - b._y, 2);
  }

  static distance(a: Vector2, b: Vector2): number {
    return Math.sqrt(Vector2.squaredDistance(a, b));
  }

  static between(vec: Vector2, bound1: Vector2, bound2: Vector2): boolean {
    if (
      vec.x >= bound1.x &&
      vec.x <= bound2.x &&
      vec.y >= bound1.y &&
      vec.y <= bound2.y
    )
      return true;

    if (
      vec.x >= bound2.x &&
      vec.x <= bound1.x &&
      vec.y >= bound2.y &&
      vec.y <= bound1.y
    )
      return true;

    return false;
  }

  static mix(a: Vector2, b: Vector2, factor: number): Vector2 {
    if (factor < 0) factor = 0;
    if (factor > 1) factor = 1;
    return new Vector2(
      a.x * factor + b.x * (1 - factor),
      a.y * factor + b.y * (1 - factor)
    );
  }

  // Refer to:
  // https://stackoverflow.com/questions/40410743/polygon-triangulation-reflex-vertex
  static det(a: Vector2, b: Vector2): number {
    return a.x * b.y - b.x * a.y;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get data(): number[] {
    return [this._x, this._y];
  }

  get magnitude(): number {
    return Math.sqrt(this._x * this._x + this._y * this._y);
  }

  get slope() {
    return this._y / this._x;
  }

  set x(value: number) {
    this._x = value;
    if (this.onChange) this.onChange(this);
  }

  set y(value: number) {
    this._y = value;
    if (this.onChange) this.onChange(this);
  }

  equals(other: Vector2): boolean {
    return this._x === other._x && this._y == other._y;
  }

  set(other: Vector2) {
    this._x = other.x;
    this._y = other.y;
  }

  clone(): Vector2 {
    return new Vector2(this._x, this._y);
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this._x + other._x, this._y + other._y);
  }

  sub(other: Vector2): Vector2 {
    return new Vector2(this._x - other._x, this._y - other._y);
  }

  arc(): number {
    return Math.atan2(this._y, this._x);
  }

  rotate(angle: number, origin: Vector2) {
    const diff = this.sub(origin);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const newX = c * diff.x - s * diff.y;
    const newY = s * diff.x + c * diff.y;
    this._x = origin.x + newX;
    this._y = origin.y + newY;
  }

  scale(factor: number) {
    this._x *= factor;
    this._y *= factor;
  }

  scaleX(factor: number) {
    this._x *= factor;
  }

  scaleY(factor: number) {
    this._y *= factor;
  }

  distanceTo(line: [Vector2, Vector2]): number {
    const p0 = this;
    const p1 = line[0];
    const p2 = line[1];

    const direction = p2.sub(p1);
    const denom = direction.magnitude;

    let inBound =
      p1.y == p2.y
        ? between(p0.x, p1.x, p2.x)
        : (() => {
            const crossSlope = Math.tan(direction.arc() + Math.PI / 2);

            const offset1 = p1.y - crossSlope * p1.x;
            const offset2 = p2.y - crossSlope * p2.x;

            const yBound1 = crossSlope * p0.x + offset1;
            const yBound2 = crossSlope * p0.x + offset2;

            return between(p0.y, yBound1, yBound2);
          })();

    if (!inBound)
      return Math.min(Vector2.distance(p0, p1), Vector2.distance(p0, p2));

    const num = Math.abs(
      (p2.x - p1.x) * (p1.y - p0.y) - (p1.x - p0.x) * (p2.y - p1.y)
    );
    return num / denom;
  }
}

function between(a: number, bound1: number, bound2: number): boolean {
  return (bound1 <= a && a <= bound2) || (bound2 <= a && a <= bound1);
}

class Vector3 {
  static get zero() {
    return new Vector3(0, 0, 0);
  }

  constructor(private _x: number, private _y: number, private _z: number) {}

  serialize(): [number, number, number] {
    return [this._x, this._y, this._z];
  }

  static deserialize(data: number[]): Vector3 {
    return new Vector3(data[0], data[1], data[2]);
  }

  static mix(a: Vector3, b: Vector3, factor: number): Vector3 {
    if (factor < 0) factor = 0;
    if (factor > 1) factor = 1;
    return new Vector3(
      a.x * factor + b.x * (1 - factor),
      a.y * factor + b.y * (1 - factor),
      a.z * factor + b.z * (1 - factor)
    );
  }

  get data(): number[] {
    return [this._x, this._y, this._z];
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get z(): number {
    return this._z;
  }

  clone(): Vector3 {
    return new Vector3(this._x, this._y, this._z);
  }
}

abstract class Color {
  static get black() {
    return new Vector3(0, 0, 0);
  }

  static get red() {
    return new Vector3(1, 0, 0);
  }

  static get green() {
    return new Vector3(0, 1, 0);
  }

  static get blue() {
    return new Vector3(0, 0, 1);
  }

  static get white() {
    return new Vector3(1, 1, 1);
  }

  static rgb(r: number, g: number, b: number) {
    return new Vector3(r / 255, g / 255, b / 255);
  }
}

const CLEAR_COLOR = new Vector3(0.5, 0.5, 0.5);
const DEFAULT_SHAPE_COLOR = Color.rgb(64, 64, 64);
const ORANGE = new Vector3(1, 0.568, 0);

class Transform {
  constructor(
    private _position: Vector2,
    private _rotation: number,
    private _scale: number
  ) {}

  static get origin(): Transform {
    return new Transform(Vector2.zero, 0, 1);
  }

  serialize(): TransformData {
    return {
      position: this.position.serialize(),
      rotation: this.rotation,
      scale: this.scale,
    };
  }

  static deserialize(data: TransformData): Transform {
    const { position, rotation, scale } = data;
    return new Transform(Vector2.deserialize(position), rotation, scale);
  }

  get position(): Vector2 {
    return this._position;
  }

  get rotation(): number {
    return this._rotation;
  }

  get scale(): number {
    return this._scale;
  }

  set position(value: Vector2) {
    this._position = value;
  }

  set x(value: number) {
    this._position.x = value;
  }

  set y(value: number) {
    this._position.y = value;
  }

  set rotation(value: number) {
    this._rotation = value;
  }

  set scale(value: number) {
    this._scale = value;
  }

  clone(): Transform {
    return new Transform(this._position.clone(), this._rotation, this._scale);
  }
}

interface TransformData {
  position: number[];
  rotation: number;
  scale: number;
}

class Vertex {
  private parent: Nullable<Shape> = null;
  public onChange: Nullable<(value: Vertex) => void> = null;

  constructor(readonly position: Vector2, private _color: Vector3) {
    this.position.onChange = () => {
      if (this.onChange) this.onChange(this);
    };
  }

  serialize(): VertexData {
    return {
      position: this.position.serialize(),
      color: this.color.serialize(),
    };
  }

  static deserialize(data: VertexData): Vertex {
    return new Vertex(
      Vector2.deserialize(data.position),
      Vector3.deserialize(data.color)
    );
  }

  origin() {
    return new Vertex(Vector2.zero, Vector3.zero);
  }

  get parentTransform(): Transform {
    return this.parent ? this.parent.transform : Transform.origin;
  }

  get color(): Vector3 {
    return this._color;
  }

  get globalCoord(): Vector2 {
    const coord = this.position.clone();
    const scale = this.parent?.transform.scale ?? 1;
    const rotation = this.parent?.transform.rotation ?? 0;
    const translation = this.parent?.transform.position ?? Vector2.zero;
    coord.scale(scale);
    coord.rotate(rotation, Vector2.zero);
    return coord.add(translation);
  }

  set globalCoord(coord: Vector2) {
    const scale = this.parent?.transform.scale ?? 1;
    const rotation = this.parent?.transform.rotation ?? 0;
    const translation = this.parent?.transform.position ?? Vector2.zero;
    const localCoord = coord.sub(translation);
    localCoord.rotate(-rotation, Vector2.zero);
    localCoord.scale(1 / scale);
    this.position.x = localCoord.x;
    this.position.y = localCoord.y;
  }

  set color(value: Vector3) {
    this._color = value;
    if (this.onChange) this.onChange(this);
  }

  get data(): number[] {
    const data = [
      this.position.data,
      this.color.data,
      this.parentTransform.position.data,
      this.parentTransform.rotation,
      this.parentTransform.scale,
    ];
    return data.flat();
  }

  distanceTo(line: [Vertex, Vertex]): number {
    const p0 = this.position;
    const p1 = line[0].position;
    const p2 = line[1].position;
    const denom = p2.sub(p1).magnitude;
    const num = Math.abs(
      (p2.x - p1.x) * (p1.y - p0.y) - (p1.x - p0.x) * (p2.y - p1.y)
    );
    return num / denom;
  }

  bind(parent: Shape) {
    this.parent = parent;
  }

  clone(): Vertex {
    return new Vertex(this.position.clone(), this.color.clone());
  }

  rotate(angle: number) {
    const origin = this.parentTransform.position;
    this.position.rotate(angle, origin);
  }

  scale(factor: number) {
    this.position.scale(factor);
  }

  scaleX(factor: number) {
    this.position.scaleX(factor);
  }

  scaleY(factor: number) {
    this.position.scaleY(factor);
  }
}

interface VertexData {
  position: [number, number];
  color: [number, number, number];
}

abstract class Shape {
  protected _vertices: Vertex[] = [];
  protected highlight: boolean = false;
  protected hidden: boolean = false;
  protected _name: string = "";
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
    return this._name;
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

  set name(name: string) {
    this._name = name;
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
    line.name = data.name;
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

class Square extends Shape {
  private firstCornerPosition: Vector2 = null;

  constructor(transform: Transform, private _size: number) {
    super(transform);
    this.initVertices();
    this.name = "Square";
    this.needUpdate = true;
  }

  static deserialize(data: ShapeData): Square {
    const rawTransform = data.transform;
    const transform = Transform.deserialize(rawTransform);
    const { vertices } = data;
    const vertex1Pos = Vector2.deserialize(vertices[0].position);
    const vertex3Pos = Vector2.deserialize(vertices[2].position);

    const square = Square.fromCorner(vertex1Pos);
    square.setNextCorner(vertex3Pos);
    square.finalize();
    square.translate(transform.position);
    square.rotate(transform.rotation);
    square.scale(transform.scale);

    for (let i = 0; i < 4; i++) {
      square.vertices[i].color = Vector3.deserialize(vertices[i].color);
    }

    square.name = data.name;
    return square;
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

  override isInsideClickArea(point: Vector2): boolean {
    const vertex1Pos = this.vertices[0].globalCoord;
    const vertex2Pos = this.vertices[1].globalCoord;
    const vertex3Pos = this.vertices[2].globalCoord;
    const vertex4Pos = this.vertices[3].globalCoord;
    return (
      Polygon.isInTriangle(point, vertex1Pos, vertex2Pos, vertex3Pos) ||
      Polygon.isInTriangle(point, vertex1Pos, vertex4Pos, vertex3Pos)
    );
  }

  override type(): string {
    return "square";
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
    this.name = "Rectangle";
    this.needUpdate = true;
  }

  static deserialize(data: ShapeData): Rectangle {
    const rawTransform = data.transform;
    const transform = Transform.deserialize(rawTransform);
    const { vertices } = data;
    const vertex1Pos = Vector2.deserialize(vertices[0].position);
    const vertex3Pos = Vector2.deserialize(vertices[2].position);

    const rectangle = Rectangle.fromCorner(vertex1Pos);
    rectangle.setNextCorner(vertex3Pos);
    rectangle.finalize();
    rectangle.translate(transform.position);
    rectangle.rotate(transform.rotation);
    rectangle.scale(transform.scale);

    for (let i = 0; i < 4; i++) {
      rectangle.vertices[i].color = Vector3.deserialize(vertices[i].color);
    }

    rectangle.name = data.name;
    return rectangle;
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

  get length(): number {
    return this._length;
  }

  get width(): number {
    return this._width;
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
    const vertex1Pos = this.vertices[0].globalCoord;
    const vertex2Pos = this.vertices[1].globalCoord;
    const vertex3Pos = this.vertices[2].globalCoord;
    const vertex4Pos = this.vertices[3].globalCoord;
    return (
      Polygon.isInTriangle(point, vertex1Pos, vertex2Pos, vertex3Pos) ||
      Polygon.isInTriangle(point, vertex1Pos, vertex4Pos, vertex3Pos)
    );
  }

  override type(): string {
    return "rectangle";
  }
}

class Polygon extends Shape {
  constructor(transform: Transform) {
    super(transform);
    this.name = "Polygon";
  }

  static deserialize(data: ShapeData): Polygon {
    const transform = Transform.deserialize(data.transform);

    const vertices = data.vertices.map((vertexData) =>
      Vertex.deserialize(vertexData)
    );

    const polygon = new Polygon(transform);
    vertices.forEach((vertex) => {
      polygon.addVertex(vertex);
    });

    polygon.name = data.name;
    return polygon;
  }

  static regular(vertices: number, radius: number): Polygon {
    const polygon = new Polygon(Transform.origin);
    let vertex = new Vertex(new Vector2(0, radius), DEFAULT_SHAPE_COLOR);
    polygon.addVertex(vertex);
    const angle = (Math.PI * 2) / vertices;

    vertices--;
    while (vertices--) {
      const newPosition = vertex.position.clone();
      newPosition.rotate(angle, Vector2.zero);
      vertex = new Vertex(newPosition, DEFAULT_SHAPE_COLOR);
      polygon.addVertex(vertex);
    }

    return polygon;
  }

  static fromStart(position: Vector2): Polygon {
    const poly = new Polygon(new Transform(position.clone(), 0, 1));
    poly.addVertex(new Vertex(Vector2.zero, DEFAULT_SHAPE_COLOR));
    poly.addVertex(new Vertex(Vector2.zero, DEFAULT_SHAPE_COLOR));
    poly.constructing = true;
    return poly;
  }

  setNextPoint(position: Vector2) {
    if (!this.constructing) return;
    const lastVertex = this._vertices[this.vertexCount - 1];
    const localPosition = position.sub(this.transform.position);
    lastVertex.position.x = localPosition.x;
    lastVertex.position.y = localPosition.y;
    this.needUpdate = true;
  }

  addNewPoint() {
    if (!this.constructing) return;
    const lastVertex = this._vertices[this.vertexCount - 1];
    this.addVertex(
      new Vertex(lastVertex.position.clone(), DEFAULT_SHAPE_COLOR)
    );
  }

  finalize() {
    this.constructing = false;
    const center = this.center;
    center.scale(this.transform.scale);
    center.rotate(this.transform.rotation, Vector2.zero);
    const centerPos = center.add(this.transform.position);

    const displacement = this.center;
    displacement.scale(-1);
    this.vertices.forEach((vertex) => {
      vertex.position.set(displacement.add(vertex.position));
    });
    this.transform.position.set(centerPos);
    this.needUpdate = true;
  }

  get data() {
    if (this.needUpdate) {
      this.needUpdate = false;
      const triangles = this._triangulate();
      this.dataCache = triangles.map((v) => v.data).flat();
    }
    return this.dataCache;
  }

  pivotIndex(): number {
    const center = this.center;
    let minDistance = Number.POSITIVE_INFINITY;
    let index = 0;

    for (let i = 0; i < this._vertices.length; i++) {
      const vertex = this._vertices[i];
      let distance = Vector2.squaredDistance(vertex.position, center);
      if (distance < minDistance) {
        minDistance = distance;
        index = i;
      }
    }

    return index;
  }

  addVertex(vertex: Vertex): void {
    this._vertices.push(vertex);
    vertex.bind(this);
    vertex.onChange = (_) => (this.needUpdate = true);
    this.needUpdate = true;
  }

  deleteVertex(vertex: Vertex | number) {
    if (vertex instanceof Vertex) this.deleteVertexByRef(vertex);
    else this.deleteVertexByIndex(vertex);
    this.needUpdate = true;
  }
  private deleteVertexByRef(vertex: Vertex) {
    const index = this._vertices.indexOf(vertex);
    this.deleteVertexByIndex(index);
  }
  private deleteVertexByIndex(index: number) {
    if (index < 0 || index >= this.vertexCount) return;
    this._vertices.splice(index, 1);
  }

  // Refer to:
  // https://www.geometrictools.com/Documentation/TriangulationByEarClipping.pdf
  private _triangulate(): Vertex[] {
    const vertices = [...this._vertices];
    let convexVertices = Polygon.convex(vertices);
    const triangles = [];
    while (vertices.length > 3) {
      let earIndex = Polygon.findEar(vertices, convexVertices);
      if (earIndex === -1) {
        convexVertices = Polygon.convex(vertices, true);
        earIndex = Polygon.findEar(vertices, convexVertices);
      }

      if (earIndex === -1) earIndex = 0;

      const vertex1 =
        vertices[(earIndex - 1 + vertices.length) % vertices.length];
      const vertex2 = vertices[earIndex];
      const vertex3 = vertices[(earIndex + 1) % vertices.length];

      triangles.push(vertex1, vertex2, vertex3);
      vertices.splice(earIndex, 1);
      convexVertices = Polygon.convex(vertices);
    }
    triangles.push(vertices[0], vertices[1], vertices[2]);

    return triangles;
  }

  static isInTriangle(
    point: Vector2,
    vertex1: Vector2,
    vertex2: Vector2,
    vertex3: Vector2
  ) {
    if (point.equals(vertex1) || point.equals(vertex2) || point.equals(vertex3))
      return false;

    const triangleArea = Polygon.doubleTriangleArea(vertex1, vertex2, vertex3);
    const area1 = Polygon.doubleTriangleArea(point, vertex1, vertex2);
    const area2 = Polygon.doubleTriangleArea(point, vertex2, vertex3);
    const area3 = Polygon.doubleTriangleArea(point, vertex3, vertex1);
    const totalArea = area1 + area2 + area3;

    return Math.abs(triangleArea - totalArea) < Number.EPSILON;
  }

  static doubleTriangleArea(a: Vector2, b: Vector2, c: Vector2) {
    return Math.abs(a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  }

  static convex(vertices: Vertex[], inverted: boolean = false): Vertex[] {
    const convexVertices = [];
    for (let i = 0; i < vertices.length; i++) {
      const vertex1Index = i === 0 ? vertices.length - 1 : i - 1;
      const vertex2Index = i;
      const vertex3Index = (i + 1) % vertices.length;

      const vertex1 = vertices[vertex1Index];
      const vertex2 = vertices[vertex2Index];
      const vertex3 = vertices[vertex3Index];

      if (!inverted && Polygon.isConvex(vertex1, vertex2, vertex3))
        convexVertices.push(vertex2);

      if (inverted && Polygon.isConvex(vertex3, vertex2, vertex1))
        convexVertices.push(vertex2);
    }
    return convexVertices;
  }

  static isConvex(vertex1: Vertex, vertex2: Vertex, vertex3: Vertex): boolean {
    const vector1 = vertex2.position.sub(vertex1.position);
    const vector2 = vertex3.position.sub(vertex2.position);

    return Vector2.det(vector1, vector2) > 0;
  }

  static convexHull(
    vertices: Vertex[],
    baseLine?: [Vertex, Vertex],
    direction?: "upwards" | "downwards"
  ): Vertex[] {
    if (baseLine) {
      if (vertices.length <= 1) return vertices;

      const farthestVertex = Polygon.getFarthestVertex(vertices, baseLine);
      const farthestVertexIndex = vertices.indexOf(farthestVertex);
      vertices.splice(farthestVertexIndex, 1);
      const newBaseLine1: [Vertex, Vertex] = [baseLine[0], farthestVertex];
      const newBaseLine2: [Vertex, Vertex] = [farthestVertex, baseLine[1]];
      const get =
        direction == "upwards"
          ? Polygon.getUpperVertices
          : Polygon.getLowerVertices;

      let chl = [];
      let chr = [];

      if (!Polygon.isVerticalLine(newBaseLine1)) {
        const newVertices = get(vertices, newBaseLine1);
        chl = Polygon.convexHull(newVertices, newBaseLine1, direction);
      }

      if (!Polygon.isVerticalLine(newBaseLine2)) {
        const newVertices = get(vertices, newBaseLine2);
        chr = Polygon.convexHull(newVertices, newBaseLine2, direction);
      }

      if (direction === "upwards") return [...chl, farthestVertex, ...chr];
      else return [...chr, farthestVertex, ...chl];
    }
    const verticesCopy = Array.from(vertices);

    let leftmostVertex = vertices[0];
    let rightmostVertex = vertices[0];

    for (const vertex of vertices) {
      const vertexX = vertex.position.x;
      const vertexY = vertex.position.y;
      const leftmostX = leftmostVertex.position.x;
      const leftmostY = leftmostVertex.position.y;
      const rightmostX = rightmostVertex.position.x;
      const rightmostY = rightmostVertex.position.y;

      if (
        vertexX < leftmostX ||
        (vertexX == leftmostX && vertexY < leftmostY)
      ) {
        leftmostVertex = vertex;
      }

      if (
        vertexX > rightmostX ||
        (vertexX == rightmostX && vertexY > rightmostY)
      ) {
        rightmostVertex = vertex;
      }
    }

    verticesCopy.splice(verticesCopy.indexOf(leftmostVertex), 1);
    verticesCopy.splice(verticesCopy.indexOf(rightmostVertex), 1);
    const line: [Vertex, Vertex] = [leftmostVertex, rightmostVertex];

    if (Polygon.isVerticalLine(line)) return line;

    const upperVertices = Polygon.getUpperVertices(verticesCopy, line);
    const lowerVertices = Polygon.getLowerVertices(verticesCopy, line);

    const chu = Polygon.convexHull(upperVertices, line, "upwards");
    const chl = Polygon.convexHull(lowerVertices, line, "downwards");

    return [leftmostVertex, ...chu, rightmostVertex, ...chl];
  }

  private static getFarthestVertex(
    vertices: Vertex[],
    line: [Vertex, Vertex]
  ): Vertex {
    let farthest = vertices[0];
    let farthestDistance = -1;
    for (const vertex of vertices) {
      const distance = vertex.distanceTo(line);
      if (distance > farthestDistance) {
        farthestDistance = distance;
        farthest = vertex;
      }
    }
    return farthest;
  }

  private static getUpperVertices(
    vertices: Vertex[],
    line: [Vertex, Vertex]
  ): Vertex[] {
    return vertices.filter((vertex) => {
      const pos0 = line[0].position;
      const pos1 = line[1].position;
      const vpos = vertex.position;
      const slope = (pos1.y - pos0.y) / (pos1.x - pos0.x);
      const lineOffset = pos0.y - slope * pos0.x;
      const offset = vpos.y - slope * vpos.x;
      return offset > lineOffset;
    });
  }

  private static getLowerVertices(
    vertices: Vertex[],
    line: [Vertex, Vertex]
  ): Vertex[] {
    return vertices.filter((vertex) => {
      const pos0 = line[0].position;
      const pos1 = line[1].position;
      const vpos = vertex.position;
      const slope = (pos1.y - pos0.y) / (pos1.x - pos0.x);
      const lineOffset = pos0.y - slope * pos0.x;
      const offset = vpos.y - slope * vpos.x;
      return offset < lineOffset;
    });
  }

  private static isVerticalLine(line: [Vertex, Vertex]): boolean {
    return line[0].position.x === line[1].position.x;
  }

  static findEar(vertices: Vertex[], convexVertices: Vertex[]): number {
    for (let i = 0; i < vertices.length; i++) {
      if (convexVertices.includes(vertices[i])) {
        const point1Index = i === 0 ? vertices.length - 1 : i - 1;
        const point2Index = (i + 1) % vertices.length;
        const pivot = vertices[i].position;
        const point1 = vertices[point1Index].position;
        const point2 = vertices[point2Index].position;
        let hasVertexInside = false;

        for (let k = 0; k < vertices.length; k++) {
          if (k == point1Index) continue;
          if (k == i) continue;
          if (k == point2Index) continue;

          if (
            Polygon.isInTriangle(vertices[k].position, point1, pivot, point2)
          ) {
            hasVertexInside = true;
            break;
          }
        }

        if (!hasVertexInside) {
          return i;
        }
      }
    }

    return -1;
  }

  override drawMode(context: WebGLRenderingContext): number {
    return context.TRIANGLES;
  }

  override isInsideClickArea(point: Vector2): boolean {
    const triangles = [...this.dataCache];
    const triangleSize = 3 * VERTEX_SIZE;

    for (let i = 0; i < triangles.length; i += triangleSize) {
      let point1 = new Vector2(triangles[i], triangles[i + 1]);
      let point2 = new Vector2(
        triangles[i + VERTEX_SIZE],
        triangles[i + VERTEX_SIZE + 1]
      );
      let point3 = new Vector2(
        triangles[i + 2 * VERTEX_SIZE],
        triangles[i + 2 * VERTEX_SIZE + 1]
      );

      point1.scale(this.transform.scale);
      point2.scale(this.transform.scale);
      point3.scale(this.transform.scale);
      point1.rotate(this.transform.rotation, Vector2.zero);
      point2.rotate(this.transform.rotation, Vector2.zero);
      point3.rotate(this.transform.rotation, Vector2.zero);
      point1 = point1.add(this.transform.position);
      point2 = point2.add(this.transform.position);
      point3 = point3.add(this.transform.position);

      if (Polygon.isInTriangle(point, point1, point2, point3)) return true;
    }
    return false;
  }

  override type(): string {
    return "polygon";
  }

  // ? Modifiers
  subdivide(division: number) {
    const newVertices = [];
    const subdivisions = [];

    for (let i = 1; i < division; i++) {
      subdivisions.push(i / division);
    }

    for (let k = 0; k < this.vertexCount; k++) {
      const vertex = this._vertices[k];
      const nextVertex = this._vertices[(k + 1) % this.vertexCount];
      const vertexPos = vertex.position;
      const nextVertexPos = nextVertex.position;

      const divisionVertices = [];

      for (const factor of subdivisions) {
        const newPos = Vector2.mix(vertexPos, nextVertexPos, 1 - factor);
        const newColor = Vector3.mix(
          vertex.color,
          nextVertex.color,
          1 - factor
        );
        const newVertex = new Vertex(newPos, newColor);
        newVertex.bind(this);
        newVertex.onChange = (_) => (this.needUpdate = true);
        divisionVertices.push(newVertex);
      }

      newVertices.push(divisionVertices);
    }

    for (let k = this.vertexCount - 1; k >= 0; k--) {
      this._vertices.splice(k + 1, 0, ...newVertices[k]);
    }

    this.needUpdate = true;
  }

  bevel(factor: number) {
    if (factor < 0) factor = 0;
    if (factor > 1) factor = 1;
    factor /= 2;

    const newVertices = [];

    for (let k = 0; k < this.vertexCount; k++) {
      const vertex = this._vertices[k];
      const nextVertex = this._vertices[(k + 1) % this.vertexCount];
      const prevVertex =
        this._vertices[(k - 1 + this.vertexCount) % this.vertexCount];

      const nextVertexPos = Vector2.mix(
        vertex.position,
        nextVertex.position,
        1 - factor
      );
      const prevVertexPos = Vector2.mix(
        vertex.position,
        prevVertex.position,
        1 - factor
      );

      const newNextVertex = new Vertex(nextVertexPos, DEFAULT_SHAPE_COLOR);
      const newPrevVertex = new Vertex(prevVertexPos, DEFAULT_SHAPE_COLOR);

      newNextVertex.bind(this);
      newNextVertex.onChange = (_) => (this.needUpdate = true);
      newPrevVertex.bind(this);
      newPrevVertex.onChange = (_) => (this.needUpdate = true);

      newVertices.push(newPrevVertex, newNextVertex);
    }

    this._vertices = [...newVertices];
    this.needUpdate = true;
  }

  triangulate(): Polygon[] {
    const vertices = this._triangulate();
    const vertexGroups: Vertex[][] = [];

    while (vertices.length > 0) {
      vertexGroups.push(vertices.splice(0, 3));
    }

    const triangles: Polygon[] = [];
    for (const vertexGroup of vertexGroups) {
      const triangle = new Polygon(this.transform.clone());
      triangle.addVertex(vertexGroup[0].clone());
      triangle.addVertex(vertexGroup[1].clone());
      triangle.addVertex(vertexGroup[2].clone());
      triangle.repositionOrigin();
      triangles.push(triangle);
    }

    return triangles;
  }

  // ? Actions
  repositionOrigin() {
    const scale = this.transform.scale;
    this.finalize();
  }

  flipNormal() {
    this.vertices.reverse();
    this.needUpdate = true;
  }
}

type ViewMode = "solid" | "wireframe";
type Mode = "object" | "edit";

class Viewer {
  private context: WebGLRenderingContext;
  public shapes: Shape[];
  private viewMode: ViewMode = "solid";
  private mode: Mode = "object";
  private selected: Nullable<Shape> = null;
  private selectedVertex: Nullable<Vertex> = null;
  private canvas: HTMLCanvasElement;
  onModeChanged: Nullable<(mode: Mode) => void> = null;

  private isCreating = false;
  private isListeningKeyPress = true;

  private originCache: number[] = [];
  private originCachePosition: Vector2 = new Vector2(0, 0);

  private shapeSelectedListeners: Listener<Shape>[] = [];
  private shapeListChangedListeners: Listener<Shape[]>[] = [];
  private vertexSelectedListeners: Listener<Vertex>[] = [];
  private actionUpdateListeners: Listener<string>[] = [];
  private shapeUpdatedListeners: Listener<Shape>[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initializeContext();
    this.shapes = [];
    this.context.viewport(0, 0, canvas.width, canvas.height);

    this.setupEventListeners();
    this.setDefaultOriginCache();
    this.setup().then(this.start.bind(this));
  }

  get currentObject(): Shape {
    return this.selected;
  }

  get currentMode(): Mode {
    return this.mode;
  }

  get currentVertex(): Vertex {
    return this.selectedVertex;
  }

  initializeContext() {
    const context = (this.canvas.getContext("webgl") ||
      this.canvas.getContext("experimental-webgl") ||
      this.canvas.getContext("webkit-3d") ||
      this.canvas.getContext("moz-webgl")) as WebGLRenderingContext;

    if (context === null) {
      alert("WebGL is not supported. Please use a different browser");
      throw "WebGL is not supported. Please use a different browser";
    }

    this.context = context;
  }

  async setup() {
    this.context.clearColor(CLEAR_COLOR.x, CLEAR_COLOR.y, CLEAR_COLOR.z, 1.0);

    this.context.enable(this.context.CULL_FACE);
    this.context.cullFace(this.context.BACK);

    const vertexShader = this.context.createShader(this.context.VERTEX_SHADER)!;
    let res = await fetch("vbasic.glsl");
    const vertexShaderSource = await res.text();
    this.context.shaderSource(vertexShader, vertexShaderSource);
    this.context.compileShader(vertexShader);
    const fragmentShader = this.context.createShader(
      this.context.FRAGMENT_SHADER
    )!;
    res = await fetch("fbasic.glsl");
    const fragmentShaderSource = await res.text();
    this.context.shaderSource(fragmentShader, fragmentShaderSource);
    this.context.compileShader(fragmentShader);
    const program = this.context.createProgram()!;
    this.context.attachShader(program, vertexShader);
    this.context.attachShader(program, fragmentShader);
    this.context.linkProgram(program);

    const buffer = this.context.createBuffer();
    this.context.bindBuffer(this.context.ARRAY_BUFFER, buffer);
    const vPositionAttribute = this.context.getAttribLocation(
      program,
      "vPosition"
    );
    const vColorAttribute = this.context.getAttribLocation(program, "vColor");
    const vParentPositionAttribute = this.context.getAttribLocation(
      program,
      "vParentPosition"
    );
    const vParentRotationAttribute = this.context.getAttribLocation(
      program,
      "vParentRotation"
    );
    const vParentScaleAttribute = this.context.getAttribLocation(
      program,
      "vParentScale"
    );
    this.context.vertexAttribPointer(
      vPositionAttribute,
      POSITION_SIZE,
      this.context.FLOAT,
      false,
      VERTEX_SIZE * FLOAT_SIZE,
      0
    );
    this.context.vertexAttribPointer(
      vColorAttribute,
      COLOR_SIZE,
      this.context.FLOAT,
      false,
      VERTEX_SIZE * FLOAT_SIZE,
      POSITION_SIZE * FLOAT_SIZE
    );
    this.context.vertexAttribPointer(
      vParentPositionAttribute,
      POSITION_SIZE,
      this.context.FLOAT,
      false,
      VERTEX_SIZE * FLOAT_SIZE,
      (POSITION_SIZE + COLOR_SIZE) * FLOAT_SIZE
    );
    this.context.vertexAttribPointer(
      vParentRotationAttribute,
      1,
      this.context.FLOAT,
      false,
      VERTEX_SIZE * FLOAT_SIZE,
      (POSITION_SIZE + COLOR_SIZE + POSITION_SIZE) * FLOAT_SIZE
    );
    this.context.vertexAttribPointer(
      vParentScaleAttribute,
      1,
      this.context.FLOAT,
      false,
      VERTEX_SIZE * FLOAT_SIZE,
      (POSITION_SIZE + COLOR_SIZE + POSITION_SIZE + 1) * FLOAT_SIZE
    );
    this.context.enableVertexAttribArray(vPositionAttribute);
    this.context.enableVertexAttribArray(vColorAttribute);
    this.context.enableVertexAttribArray(vParentPositionAttribute);
    this.context.enableVertexAttribArray(vParentRotationAttribute);
    this.context.enableVertexAttribArray(vParentScaleAttribute);

    this.context.useProgram(program);
  }

  setupEventListeners() {
    window.addEventListener("keypress", (e: KeyboardEvent) => {
      this.onKeyPressed(e.code);
    });

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      this.onKeyDown(e);
    });

    this.canvas.addEventListener("click", (e: PointerEvent) => {
      this.onClick(e);
    });
  }

  setDefaultOriginCache() {
    const vertex1 = new Vertex(
      new Vector2(0, ORIGIN_CURSOR_RADIUS),
      Color.black
    );
    const vertex2 = new Vertex(
      new Vector2(0, -ORIGIN_CURSOR_RADIUS),
      Color.black
    );
    const vertex3 = new Vertex(Vector2.zero, Color.black);
    const vertex4 = new Vertex(
      new Vector2(ORIGIN_CURSOR_RADIUS, 0),
      Color.black
    );
    const vertex5 = new Vertex(
      new Vector2(-ORIGIN_CURSOR_RADIUS, 0),
      Color.black
    );
    this.originCache = [
      ...vertex1.data,
      ...vertex2.data,
      ...vertex3.data,
      ...vertex4.data,
      ...vertex5.data,
    ];
  }

  onShapeSelected(listener: Listener<Shape>) {
    this.shapeSelectedListeners.push(listener);
  }

  onShapeListChanged(listener: Listener<Shape[]>) {
    this.shapeListChangedListeners.push(listener);
  }

  onVertexSelected(listener: Listener<Vertex>) {
    this.vertexSelectedListeners.push(listener);
  }

  onNewAction(listener: Listener<string>) {
    this.actionUpdateListeners.push(listener);
  }

  onSelectedShapeUpdated(listener: Listener<Shape>) {
    this.shapeUpdatedListeners.push(listener);
  }

  updateAction(action: string) {
    this.isCreating = !!action;

    this.actionUpdateListeners.forEach((listener) => listener(action));
  }

  onKeyPressed(code: string) {
    if (!this.isListeningKeyPress) return;

    switch (code) {
      case "KeyQ":
        this.setViewMode("solid");
        break;
      case "KeyW":
        this.setViewMode("wireframe");
        break;
      case "KeyH":
        if (this.mode === "object" && this.selected) {
          this.selected.isHidden = !this.selected.isHidden;
          this.shapeListChangedListeners.forEach((listener) =>
            listener(this.shapes)
          );
        }
        break;
      case "KeyX":
        if (this.selected && this.mode === "object") {
          this.deleteObject(this.selected);
          this.select(null);
        }
        if (
          this.selectedVertex &&
          this.mode === "edit" &&
          this.selected instanceof Polygon
        ) {
          this.selected.deleteVertex(this.selectedVertex);
          this.selectVertex(null);
        }
        break;
      case "KeyG":
        if (this.mode === "edit" && this.selectedVertex)
          this.grabSelectedVertex();
        if (this.mode === "object" && this.selected) this.grabSelected();
        break;
      case "KeyR":
        if (this.selected) this.rotateSelected();
        break;
      case "KeyS":
        if (this.selected) this.scaleSelected();
        break;
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.isListeningKeyPress) return;

    switch (event.code) {
      case "Tab":
        event.preventDefault();
        if (this.selected) this.switchMode();
        break;
    }
  }

  onClick(event: MouseEvent) {
    if (this.isCreating) return;

    if (event.ctrlKey) return this.onCtrlClick(event);

    this.mode === "object"
      ? this.trySelectShape(event)
      : this.trySelectVertex(event);
  }

  onCtrlClick(event: MouseEvent) {
    if (this.mode === "object" || !(this.selected instanceof Polygon)) return;
    const selected = this.selected as Polygon;
    const vertex = new Vertex(Vector2.zero, DEFAULT_SHAPE_COLOR);
    selected.addVertex(vertex);
    this.selectVertex(vertex);
    const globalCoord = this.normalizeCoord(
      new Vector2(event.clientX, event.clientY)
    );
    vertex.globalCoord = globalCoord;
  }

  disableKeyPress() {
    this.isListeningKeyPress = false;
  }

  enableKeyPress() {
    this.isListeningKeyPress = true;
  }

  trySelectShape(event: MouseEvent) {
    const canvasRect = this.canvas.getBoundingClientRect();
    const rectOffset = new Vector2(
      event.clientX - canvasRect.x,
      event.clientY - canvasRect.y
    );
    rectOffset.scaleX(1 / canvasRect.width);
    rectOffset.scaleY(1 / canvasRect.height);
    const normalizedCoord = new Vector2(
      (rectOffset.x - 0.5) * 2,
      (rectOffset.y - 0.5) * 2
    );
    normalizedCoord.scaleY(-1);

    for (const shape of [...this.shapes].reverse()) {
      if (shape.isHidden) continue;
      if (shape.isInsideClickArea(normalizedCoord)) return this.select(shape);
    }

    this.select(null);
  }

  trySelectVertex(event: MouseEvent) {
    const canvasRect = this.canvas.getBoundingClientRect();
    const rectOffset = new Vector2(
      event.clientX - canvasRect.x,
      event.clientY - canvasRect.y
    );
    rectOffset.scaleX(1 / canvasRect.width);
    rectOffset.scaleY(1 / canvasRect.height);
    const normalizedCoord = new Vector2(
      (rectOffset.x - 0.5) * 2,
      (rectOffset.y - 0.5) * 2
    );
    normalizedCoord.scaleY(-1);

    let selectedVertex = null;
    let minDistance = 2;
    for (const vertex of this.selected.vertices) {
      const distance = Vector2.distance(normalizedCoord, vertex.globalCoord);
      if (distance < minDistance) {
        selectedVertex = vertex;
        minDistance = distance;
      }
    }

    this.selectVertex(minDistance <= 0.02 ? selectedVertex : null);
  }

  renameSelected(name: string) {
    if (!this.selected) return;

    this.selected.name = name;
    this.shapeListChangedListeners.forEach((listener) => listener(this.shapes));
  }

  grabSelected() {
    let initialX: number;
    let initialY: number;
    let initialPosition: Vector2;
    window.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        initialX = e.clientX;
        initialY = e.clientY;
        initialPosition = this.selected.transform.position.clone();
      },
      {
        once: true,
      }
    );

    const setter: (_: MouseEvent) => any = (e: MouseEvent) => {
      if (!initialX || !initialY) return;
      const canvasRect = this.canvas.getBoundingClientRect();
      const delta = new Vector2(
        (e.clientX - initialX) / canvasRect.width,
        (initialY - e.clientY) / canvasRect.height
      );
      delta.scale(2);
      const newPosition = initialPosition.add(delta);
      this.selected.transform.position.set(newPosition);
      this.selected.update();
    };
    window.addEventListener("mousemove", setter);

    const stopper: (_: MouseEvent | KeyboardEvent) => any = (
      e: MouseEvent | KeyboardEvent
    ) => {
      if (e instanceof MouseEvent || (e as KeyboardEvent).code === "Escape") {
        window.removeEventListener("mousemove", setter);
        window.removeEventListener("keydown", stopper);
        window.removeEventListener("click", stopper);

        if (e instanceof KeyboardEvent) {
          this.selected.transform.position.set(initialPosition);
          this.selected.update();
        }
      }
    };
    window.addEventListener("keydown", stopper);
    window.addEventListener("click", stopper);
  }

  grabSelectedVertex() {
    let initialNormalizedCoord: Vector2;
    let initialPosition: Vector2;
    window.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        const screenCoord = new Vector2(e.clientX, e.clientY);
        initialNormalizedCoord = this.normalizeCoord(screenCoord);
        initialPosition = this.selectedVertex.position.clone();
      },
      {
        once: true,
      }
    );

    const setter: (_: MouseEvent) => any = (e: MouseEvent) => {
      if (!initialNormalizedCoord) return;
      const screenCoord = new Vector2(e.clientX, e.clientY);
      const normalizedCoord = this.normalizeCoord(screenCoord);
      this.selectedVertex.globalCoord = normalizedCoord;
    };
    window.addEventListener("mousemove", setter);

    const stopper: (_: MouseEvent | KeyboardEvent) => any = (
      e: MouseEvent | KeyboardEvent
    ) => {
      if (e instanceof MouseEvent || (e as KeyboardEvent).code === "Escape") {
        window.removeEventListener("mousemove", setter);
        window.removeEventListener("keydown", stopper);
        window.removeEventListener("click", stopper);

        if (e instanceof KeyboardEvent) {
          this.selectedVertex.position.x = initialPosition.x;
          this.selectedVertex.position.y = initialPosition.y;
          this.selected.update();
        }
      }
    };
    window.addEventListener("keydown", stopper);
    window.addEventListener("click", stopper);
  }

  rotateSelected() {
    if (this.mode === "edit") return;

    let initialAngle: number;
    let initialRotation = this.selected.transform.rotation;
    const canvasRect = this.canvas.getBoundingClientRect();
    let selectedPos = this.selectedCoord.clone();
    selectedPos.scaleY(-1);
    selectedPos.scale(0.5);
    selectedPos.x += 0.5;
    selectedPos.y += 0.5;
    selectedPos.scaleX(canvasRect.width);
    selectedPos.scaleY(canvasRect.height);
    selectedPos.x += canvasRect.x;
    selectedPos.y += canvasRect.y;

    window.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        const initialPos = new Vector2(e.clientX, e.clientY);
        // ? Negates because positive y is downwards
        initialAngle = -initialPos.sub(selectedPos).arc();
      },
      {
        once: true,
      }
    );

    const setter: (_: MouseEvent) => any = (e: MouseEvent) => {
      if (!initialAngle) return;
      const currentPos = new Vector2(e.clientX, e.clientY);
      // ? Negates because positive y is downwards
      const angle = -currentPos.sub(selectedPos).arc();
      const diff = angle - initialAngle;
      this.selected.transform.rotation = initialRotation + diff;
    };
    window.addEventListener("mousemove", setter);

    const stopper: (_: MouseEvent | KeyboardEvent) => any = (
      e: MouseEvent | KeyboardEvent
    ) => {
      if (e instanceof MouseEvent || (e as KeyboardEvent).code === "Escape") {
        window.removeEventListener("mousemove", setter);
        window.removeEventListener("keydown", stopper);
        window.removeEventListener("click", stopper);

        if (e instanceof KeyboardEvent) {
          this.selected.transform.rotation = initialRotation;
        }
      }
    };
    window.addEventListener("keydown", stopper);
    window.addEventListener("click", stopper);
  }

  scaleSelected() {
    if (this.mode === "edit") return;

    let initialDistance: number;
    let initialScale = this.selected.transform.scale;
    const canvasRect = this.canvas.getBoundingClientRect();
    let selectedPos = this.selectedCoord.clone();
    selectedPos.scaleY(-1);
    selectedPos.scale(0.5);
    selectedPos.x += 0.5;
    selectedPos.y += 0.5;
    selectedPos.scaleX(canvasRect.width);
    selectedPos.scaleY(canvasRect.height);
    selectedPos.x += canvasRect.x;
    selectedPos.y += canvasRect.y;

    window.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        const initialPos = new Vector2(e.clientX, e.clientY);
        initialDistance = Vector2.distance(selectedPos, initialPos);
      },
      {
        once: true,
      }
    );

    const setter: (_: MouseEvent) => any = (e: MouseEvent) => {
      const currentPos = new Vector2(e.clientX, e.clientY);
      const distance = Vector2.distance(selectedPos, currentPos);
      const scale = distance / initialDistance;
      this.selected.transform.scale = initialScale * scale;
    };
    window.addEventListener("mousemove", setter);

    const stopper: (_: MouseEvent | KeyboardEvent) => any = (
      e: MouseEvent | KeyboardEvent
    ) => {
      if (e instanceof MouseEvent || (e as KeyboardEvent).code === "Escape") {
        window.removeEventListener("mousemove", setter);
        window.removeEventListener("keydown", stopper);
        window.removeEventListener("click", stopper);

        if (e instanceof KeyboardEvent) {
          this.selected.transform.scale = initialScale;
        }
      }
    };
    window.addEventListener("keydown", stopper);
    window.addEventListener("click", stopper);
  }

  get selectedCoord(): Vector2 {
    return this.selected?.transform.position;
  }

  start() {
    onNextFrame(this.render.bind(this));
  }

  render() {
    this.context.clear(this.context.COLOR_BUFFER_BIT);
    for (const shape of this.shapes) {
      if (shape.isHidden) continue;

      if (shape === this.selected && shape.willUpdate)
        this.shapeUpdatedListeners.forEach((listener) =>
          listener(this.selected)
        );

      if (shape.constructing) {
        const data = shape.vertices.map((v) => v.data).flat();
        this.drawOutline(data, shape, ORANGE);
        shape.vertices.forEach((vertex) => this.drawPoint(vertex, ORANGE));
        continue;
      }

      const data = Array.from(shape.data);

      if (this.viewMode === "solid") {
        this.context.bufferData(
          this.context.ARRAY_BUFFER,
          new Float32Array(data),
          this.context.DYNAMIC_DRAW
        );

        this.context.drawArrays(
          shape.drawMode(this.context),
          0,
          data.length / VERTEX_SIZE
        );

        const orderedVerticesData = shape.vertices.map((v) => v.data).flat();
        this.context.bufferData(
          this.context.ARRAY_BUFFER,
          new Float32Array(orderedVerticesData),
          this.context.DYNAMIC_DRAW
        );
        this.context.drawArrays(
          this.context.LINE_LOOP,
          0,
          orderedVerticesData.length / VERTEX_SIZE
        );
      }

      if (this.viewMode === "wireframe") {
        this.drawOutline(data, shape, Color.black);
        shape.vertices.forEach((vertex) => this.drawPoint(vertex, Color.black));
      }

      if (shape === this.selected) {
        if (this.mode === "object") {
          const originData = this.getOriginData(shape.transform.position);
          this.context.bufferData(
            this.context.ARRAY_BUFFER,
            new Float32Array(originData),
            this.context.DYNAMIC_DRAW
          );

          this.context.drawArrays(
            this.context.LINE_STRIP,
            0,
            originData.length / VERTEX_SIZE
          );
        }

        const highlightColor = this.mode === "object" ? ORANGE : Color.black;
        this.drawOutline(data, shape, highlightColor);
        shape.vertices.forEach((vertex) =>
          this.drawPoint(vertex, highlightColor)
        );
      }
    }

    if (this.mode === "edit" && this.selectedVertex) {
      this.drawPoint(this.selectedVertex, ORANGE);
    }

    onNextFrame(this.render.bind(this));
  }

  getOriginData(position: Vector2): number[] {
    if (!this.originCachePosition.equals(position)) {
      const vertex1 = new Vertex(
        position.add(new Vector2(0, ORIGIN_CURSOR_RADIUS)),
        Color.black
      );
      const vertex2 = new Vertex(
        position.sub(new Vector2(0, ORIGIN_CURSOR_RADIUS)),
        Color.black
      );
      const vertex3 = new Vertex(position, Color.black);
      const vertex4 = new Vertex(
        position.add(new Vector2(ORIGIN_CURSOR_RADIUS, 0)),
        Color.black
      );
      const vertex5 = new Vertex(
        position.sub(new Vector2(ORIGIN_CURSOR_RADIUS, 0)),
        Color.black
      );
      this.originCache = [
        ...vertex1.data,
        ...vertex2.data,
        ...vertex3.data,
        ...vertex4.data,
        ...vertex5.data,
      ];
      this.originCachePosition.set(position);
    }

    return this.originCache;
  }

  drawOutline(verticesData: number[], shape: Shape, color: Vector3) {
    if (shape.drawMode(this.context) === this.context.TRIANGLES)
      verticesData = shape.vertices.map((v) => v.data).flat();

    const vertexCount = verticesData.length / VERTEX_SIZE;
    for (let i = 0; i < vertexCount; i++) {
      // R channel
      verticesData[VERTEX_SIZE * i + R] = color.x;
      // G channel
      verticesData[VERTEX_SIZE * i + G] = color.y;
      // B channel
      verticesData[VERTEX_SIZE * i + B] = color.z;
    }

    this.context.bufferData(
      this.context.ARRAY_BUFFER,
      new Float32Array(verticesData),
      this.context.DYNAMIC_DRAW
    );
    this.context.drawArrays(this.context.LINE_LOOP, 0, vertexCount);
  }

  drawPoint(vertex: Vertex, color: Vector3) {
    let data = vertex.data.flat();
    data[R] = color.x;
    data[G] = color.y;
    data[B] = color.z;

    // Actual vertex coords
    const position = new Vector2(data[0], data[1]);
    const parentPosition = new Vector2(
      data[PARENT_POSITION_INDEX],
      data[PARENT_POSITION_INDEX + 1]
    );
    const parentRotation = data[PARENT_ROTATION_INDEX];
    const parentScale = data[PARENT_SCALE_INDEX];
    position.scale(parentScale);
    position.rotate(parentRotation, Vector2.zero);
    const vertexCoord = parentPosition.add(position);

    let point = new Vector2(POINT_RADIUS, 0);
    for (let i = 0; i < 9; i++) {
      // ? Circle coordinates
      data.push(point.x, point.y);
      // ? Vertex color
      data.push(color.x, color.y, color.z);
      // ? Center (origin) coordinate
      data.push(vertexCoord.x, vertexCoord.y);
      // ? Rotation
      data.push((i * Math.PI) / 4);
      // ? Scale
      data.push(1);
    }

    this.context.bufferData(
      this.context.ARRAY_BUFFER,
      new Float32Array(data),
      this.context.DYNAMIC_DRAW
    );

    this.context.drawArrays(this.context.TRIANGLE_FAN, 0, 10);
  }

  addObject(object: Shape) {
    this.shapes.push(object);
    this.shapeListChangedListeners.forEach((listener) => listener(this.shapes));
  }

  deleteObject(object: Shape | number) {
    if (object instanceof Shape) {
      const index = this.shapes.indexOf(object);
      return this.deleteObject(index);
    }
    this.shapes.splice(object, 1);
    this.shapeListChangedListeners.forEach((listener) => listener(this.shapes));
  }

  select(object: Nullable<Shape>) {
    this.selectedVertex = null;
    for (const shape of this.shapes) {
      shape.isHighlighted = shape === object;
    }
    this.selected = object;
    this.shapeSelectedListeners.forEach((listener) => listener(this.selected));
    this.shapeListChangedListeners.forEach((listener) => listener(this.shapes));
  }

  selectVertex(vertex: Nullable<Vertex>) {
    this.selectedVertex = vertex;
    this.vertexSelectedListeners.forEach((listener) =>
      listener(this.selectedVertex)
    );
  }

  setViewMode(viewMode: ViewMode) {
    this.viewMode = viewMode;
  }

  switchViewMode() {
    this.viewMode = this.viewMode === "solid" ? "wireframe" : "solid";
  }

  switchMode() {
    switch (this.mode) {
      case "edit":
        this.mode = "object";
        break;
      case "object":
        this.mode = this.selected ? "edit" : "object";
        break;
    }
    if (this.onModeChanged) this.onModeChanged(this.mode);
  }

  normalizeCoord(coord: Vector2) {
    const canvasRect = this.canvas.getBoundingClientRect();
    const rectOffset = new Vector2(
      coord.x - canvasRect.x,
      coord.y - canvasRect.y
    );
    rectOffset.scaleX(1 / canvasRect.width);
    rectOffset.scaleY(1 / canvasRect.height);
    const normalizedCoord = new Vector2(
      (rectOffset.x - 0.5) * 2,
      (rectOffset.y - 0.5) * 2
    );
    normalizedCoord.scaleY(-1);
    return normalizedCoord;
  }

  createDefaultLine(): Line {
    const lengthString = prompt("Line length: (default 0.4)");
    let length = parseFloat(lengthString);
    length = isNaN(length) ? 0.4 : length;
    length = length > 2 * Math.SQRT2 ? 0.4 : length;
    length = length <= 0 ? 0.4 : length;
    const line = new Line(Transform.origin, length);
    this.addObject(line);
    return line;
  }

  createDefaultSquare(): Square {
    const sizeString = prompt("Square size: (default 0.2)");
    let size = parseFloat(sizeString);
    size = isNaN(size) ? 0.2 : size;
    size = size > 2 ? 0.2 : size;
    size = size <= 0 ? 0.2 : size;
    const square = new Square(Transform.origin, size);
    this.addObject(square);
    return square;
  }

  createDefaultRectangle(): Rectangle {
    const lengthString = prompt("Rectangle length: (default 0.4)");
    let length = parseFloat(lengthString);
    length = isNaN(length) ? 0.4 : length;
    length = length > 2 ? 0.4 : length;
    length = length <= 0 ? 0.4 : length;

    const widthString = prompt("Rectangle width: (default 0.15)");
    let width = parseFloat(widthString);
    width = isNaN(width) ? 0.15 : width;
    width = width > 2 ? 0.15 : width;
    width = width <= 0 ? 0.15 : width;

    const rectangle = new Rectangle(Transform.origin, length, width);
    this.addObject(rectangle);
    return rectangle;
  }

  createDefaultPolygon(): Polygon {
    const sideString = prompt("Polygon sides: (default 5)");
    let side = parseInt(sideString);
    side = isNaN(side) ? 0.25 : side;
    side = side <= 2 ? 5 : side;

    const sizeString = prompt("Polygon size: (default 0.2)");
    let size = parseFloat(sizeString);
    size = isNaN(size) ? 0.2 : size;
    size = size > 2 ? 0.2 : size;
    size = size <= 0 ? 0.2 : size;

    const polygon = Polygon.regular(side, size);
    this.addObject(polygon);
    return polygon;
  }

  createSquare() {
    this.updateAction("Creating square");

    this.canvas.addEventListener(
      "click",
      (event: MouseEvent) => {
        const firstCorner = this.normalizeCoord(
          new Vector2(event.clientX, event.clientY)
        );
        const square = Square.fromCorner(firstCorner);
        this.addObject(square);

        const moveController = new AbortController();
        this.canvas.addEventListener(
          "mousemove",
          (event: MouseEvent) => {
            const secondCorner = this.normalizeCoord(
              new Vector2(event.clientX, event.clientY)
            );
            square.setNextCorner(secondCorner);
          },
          { signal: moveController.signal } as AddEventListenerOptions
        );

        this.canvas.addEventListener(
          "click",
          (_: MouseEvent) => {
            square.finalize();
            moveController.abort();
            this.select(square);
            this.updateAction("");
          },
          {
            once: true,
          }
        );
      },
      {
        once: true,
      }
    );
  }

  createLine() {
    this.updateAction("Creating line");

    this.canvas.addEventListener(
      "click",
      (event: MouseEvent) => {
        const firstPoint = this.normalizeCoord(
          new Vector2(event.clientX, event.clientY)
        );
        const line = Line.fromStart(firstPoint);
        this.addObject(line);

        const moveController = new AbortController();
        this.canvas.addEventListener(
          "mousemove",
          (event: MouseEvent) => {
            const secondPoint = this.normalizeCoord(
              new Vector2(event.clientX, event.clientY)
            );
            line.setNextPoint(secondPoint);
          },
          { signal: moveController.signal } as AddEventListenerOptions
        );

        this.canvas.addEventListener(
          "click",
          (_: MouseEvent) => {
            line.finalize();
            moveController.abort();
            this.select(line);
            this.updateAction("");
          },
          {
            once: true,
          }
        );
      },
      {
        once: true,
      }
    );
  }

  createRectangle() {
    this.updateAction("Creating rectangle");

    this.canvas.addEventListener(
      "click",
      (event: MouseEvent) => {
        const firstCorner = this.normalizeCoord(
          new Vector2(event.clientX, event.clientY)
        );
        const rectangle = Rectangle.fromCorner(firstCorner);
        this.addObject(rectangle);

        const moveController = new AbortController();
        this.canvas.addEventListener(
          "mousemove",
          (event: MouseEvent) => {
            const secondCorner = this.normalizeCoord(
              new Vector2(event.clientX, event.clientY)
            );
            rectangle.setNextCorner(secondCorner);
          },
          { signal: moveController.signal } as AddEventListenerOptions
        );

        this.canvas.addEventListener(
          "click",
          (_: MouseEvent) => {
            rectangle.finalize();
            moveController.abort();
            this.select(rectangle);
            this.updateAction("");
          },
          {
            once: true,
          }
        );
      },
      {
        once: true,
      }
    );
  }

  createPolygon() {
    this.updateAction("Creating polygon");

    this.canvas.addEventListener(
      "click",
      (event: MouseEvent) => {
        const firstPoint = this.normalizeCoord(
          new Vector2(event.clientX, event.clientY)
        );
        const poly = Polygon.fromStart(firstPoint);
        this.addObject(poly);

        const addPointController = new AbortController();
        this.canvas.addEventListener(
          "mousemove",
          (event: MouseEvent) => {
            const secondCorner = this.normalizeCoord(
              new Vector2(event.clientX, event.clientY)
            );
            poly.setNextPoint(secondCorner);
          },
          { signal: addPointController.signal } as AddEventListenerOptions
        );

        this.canvas.addEventListener(
          "click",
          (e: MouseEvent) => {
            if (e.ctrlKey) {
              poly.finalize();
              addPointController.abort();
              this.select(poly);
              this.updateAction("");
              return;
            }

            poly.addNewPoint();
          },
          { signal: addPointController.signal } as AddEventListenerOptions
        );
      },
      {
        once: true,
      }
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
  const viewer = new Viewer(canvas);

  setupButtons(viewer);

  const objectList = document.getElementById("object-list");
  viewer.onShapeListChanged((objects) =>
    window.requestAnimationFrame(() => {
      objectList.innerHTML = "";
      objects.forEach((object) => {
        const li = document.createElement("li");
        li.innerText = object.name;
        li.style.cursor = "pointer";
        li.classList.add("object-name");
        if (viewer.currentObject === object) {
          li.classList.add("selected");
        }
        if (object.isHidden) {
          li.classList.add("hidden");
        }
        li.addEventListener("click", () => {
          viewer.select(object);
        });
        objectList.appendChild(li);
      });
    })
  );

  const actionLabel = document.getElementById("action");
  viewer.onNewAction((action) => {
    actionLabel.innerText = action;
  });
});

function setupButtons(viewer: Viewer) {
  const solidViewButton = document.getElementById("solid");
  const wireframeViewButton = document.getElementById("wireframe");

  const newLineButton = document.getElementById("line");
  const newSquareButton = document.getElementById("square");
  const newRectangleButton = document.getElementById("rect");
  const newPolygonButton = document.getElementById("poly");

  const newCustomLineButton = document.getElementById("line-custom");
  const newCustomSquareButton = document.getElementById("square-custom");
  const newCustomRectangleButton = document.getElementById("rect-custom");
  const newCustomPolygonButton = document.getElementById("poly-custom");

  const subdivButton = document.getElementById("mod-subdiv");
  const bevelButton = document.getElementById("mod-bevel");
  const triangulateButton = document.getElementById("mod-tri");

  const repositionOriginButton = document.getElementById("reposition-origin");
  const flipNormalButton = document.getElementById("flip-normal");

  const modeDisplay = document.getElementById("mode");

  const importButton = document.getElementById("import");
  const exportButton = document.getElementById("export");
  const importFileInput = document.getElementById(
    "import-file"
  ) as HTMLInputElement;
  importFileInput.addEventListener("input", () => {});

  const colorInput = document.getElementById("color-all") as HTMLInputElement;
  const lineLengthInput = document.getElementById(
    "line-length"
  ) as HTMLInputElement;
  const lineLengthPreview = document.getElementById("line-length-preview");
  const squareSizeInput = document.getElementById(
    "square-size"
  ) as HTMLInputElement;
  const squareSizePreview = document.getElementById("square-size-preview");
  const rectangleLengthInput = document.getElementById(
    "rectangle-length"
  ) as HTMLInputElement;
  const rectangleLengthPreview = document.getElementById(
    "rectangle-length-preview"
  );
  const rectangleWidthInput = document.getElementById(
    "rectangle-width"
  ) as HTMLInputElement;
  const rectangleWidthPreview = document.getElementById(
    "rectangle-width-preview"
  );

  const nameProperty = document.getElementById(
    "object-name"
  ) as HTMLInputElement;

  const lineProperties = document.getElementById("line-properties");
  const squareProperties = document.getElementById("square-properties");
  const rectangleProperties = document.getElementById("rectangle-properties");
  const properties = [lineProperties, squareProperties, rectangleProperties];

  viewer.onModeChanged = (mode) => {
    modeDisplay.innerText = `${mode === "object" ? "Object" : "Edit"} mode`;
  };

  solidViewButton.addEventListener("click", () => {
    viewer.setViewMode("solid");
  });

  wireframeViewButton.addEventListener("click", () => {
    viewer.setViewMode("wireframe");
  });

  newLineButton.addEventListener("click", () => {
    viewer.createDefaultLine();
  });

  newCustomLineButton.addEventListener("click", () => {
    viewer.createLine();
  });

  newCustomSquareButton.addEventListener("click", () => {
    viewer.createSquare();
  });

  newCustomRectangleButton.addEventListener("click", () => {
    viewer.createRectangle();
  });

  newCustomPolygonButton.addEventListener("click", () => {
    viewer.createPolygon();
  });

  newSquareButton.addEventListener("click", () => {
    viewer.createDefaultSquare();
  });

  newRectangleButton.addEventListener("click", () => {
    viewer.createDefaultRectangle();
  });

  newPolygonButton.addEventListener("click", () => {
    viewer.createDefaultPolygon();
  });

  subdivButton.addEventListener("click", () => {
    if (!(viewer.currentObject instanceof Polygon)) return;

    const divisionString = prompt("Division: (default 2)");
    let division = parseInt(divisionString);
    division = isNaN(division) ? 2 : division;
    division = division <= 2 ? 2 : division;

    viewer.currentObject.subdivide(division);
  });

  bevelButton.addEventListener("click", () => {
    if (!(viewer.currentObject instanceof Polygon)) return;
    const lengthString = prompt("Length: (0 to 1, default 0.2)");
    let length = parseFloat(lengthString);
    length = isNaN(length) ? 0.2 : length;
    viewer.currentObject.bevel(length);
  });

  triangulateButton.addEventListener("click", () => {
    if (!(viewer.currentObject instanceof Polygon)) return;
    const triangles = viewer.currentObject.triangulate();
    viewer.deleteObject(viewer.currentObject);
    triangles.forEach(viewer.addObject.bind(viewer));
  });

  repositionOriginButton.addEventListener("click", () => {
    if (!(viewer.currentObject instanceof Polygon)) return;
    viewer.currentObject.repositionOrigin();
  });

  flipNormalButton.addEventListener("click", () => {
    if (!(viewer.currentObject instanceof Polygon)) return;
    viewer.currentObject.flipNormal();
  });

  colorInput.addEventListener("input", () => {
    if (!viewer.currentObject) return;
    if (viewer.currentMode == "edit" && !viewer.currentVertex) return;

    const colorString = colorInput.value;
    const r = parseInt(colorString.slice(1, 3), 16);
    const g = parseInt(colorString.slice(3, 5), 16);
    const b = parseInt(colorString.slice(5, 7), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) return;
    const color = Color.rgb(r, g, b);

    if (viewer.currentMode == "edit") viewer.currentVertex.color = color;
    else viewer.currentObject.setVerticesColor(color);
  });

  nameProperty.addEventListener("input", () => {
    viewer.renameSelected(nameProperty.value);
  });

  nameProperty.addEventListener("focusin", () => {
    viewer.disableKeyPress();
  });

  nameProperty.addEventListener("focusout", () => {
    viewer.enableKeyPress();
  });

  lineLengthInput.addEventListener("input", () => {
    if (!(viewer.currentObject instanceof Line)) return;
    viewer.currentObject.length = parseFloat(lineLengthInput.value);
  });

  squareSizeInput.addEventListener("input", () => {
    if (!(viewer.currentObject instanceof Square)) return;
    viewer.currentObject.size = parseFloat(squareSizeInput.value);
  });

  rectangleLengthInput.addEventListener("input", () => {
    if (!(viewer.currentObject instanceof Rectangle)) return;
    viewer.currentObject.length = parseFloat(rectangleLengthInput.value);
  });

  rectangleWidthInput.addEventListener("input", () => {
    if (!(viewer.currentObject instanceof Rectangle)) return;
    viewer.currentObject.width = parseFloat(rectangleWidthInput.value);
  });

  exportButton.addEventListener("click", () => {
    if (!viewer.currentObject) return;

    const shapeData = viewer.currentObject.serialize();
    const shapeDataString = JSON.stringify(shapeData);
    saveJson(shapeDataString, viewer.currentObject.name);
  });

  importButton.addEventListener("click", () => {
    importFileInput.addEventListener(
      "change",
      async () => {
        if (!importFileInput.value) return;

        const file = importFileInput.files[0];

        const rawData = await file.text();
        const data = JSON.parse(rawData);
        const { type } = data;

        let shape: Shape;

        switch (type) {
          case "line":
            shape = Line.deserialize(data);
            break;
          case "square":
            shape = Square.deserialize(data);
            break;
          case "rectangle":
            shape = Rectangle.deserialize(data);
            break;
          case "polygon":
            shape = Polygon.deserialize(data);
        }

        viewer.addObject(shape);
        importFileInput.value = null;
      },
      {
        once: true,
      }
    );

    importFileInput.click();
  });

  viewer.onSelectedShapeUpdated(synchronizeProperties);

  viewer.onShapeSelected((object) => {
    if (object === null) return;

    properties.forEach((property) =>
      property.style.setProperty("display", "none")
    );

    nameProperty.value = object.name;

    if (object instanceof Line) {
      lineProperties.style.removeProperty("display");
    }

    if (object instanceof Square) {
      squareProperties.style.removeProperty("display");
    }

    if (object instanceof Rectangle) {
      rectangleProperties.style.removeProperty("display");
    }

    synchronizeProperties(object);
  });

  function synchronizeProperties(object: Shape) {
    if (object instanceof Line) {
      lineLengthPreview.innerText = object.length.toFixed(3);
      lineLengthInput.value = object.length.toFixed(3);
    }

    if (object instanceof Square) {
      squareSizePreview.innerText = object.size.toFixed(3);
      squareSizeInput.value = object.size.toFixed(3);
    }

    if (object instanceof Rectangle) {
      rectangleLengthPreview.innerText = object.length.toFixed(3);
      rectangleWidthPreview.innerText = object.width.toFixed(3);
      rectangleLengthInput.value = object.length.toFixed(3);
      rectangleWidthInput.value = object.width.toFixed(3);
    }
  }
}

function saveJson(data: string, name: string) {
  const blob = new Blob([data], { type: "application/json" });
  const anchor = window.document.createElement("a");
  anchor.href = window.URL.createObjectURL(blob);
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

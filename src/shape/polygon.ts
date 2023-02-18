import { Transform } from "../geometry/transform";
import { Vector2, Vector3 } from "../geometry/vector";
import { Vertex } from "../geometry/vertex";
import { DEFAULT_SHAPE_COLOR } from "../util";
import { Shape } from "./shape";

class Polygon extends Shape {
  constructor(transform: Transform) {
    super(transform);
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
    const displacement = this.transform.position.sub(center);
    this.vertices.forEach((vertex) => {
      vertex.position.set(displacement.add(vertex.position));
    });
    this.transform.position.set(center);
    console.log(this.transform.position);
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

  drawMode(context: WebGLRenderingContext): number {
    // return context.TRIANGLE_FAN;
    return context.TRIANGLES;
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
      triangles.push(triangle);
    }

    return triangles;
  }
}

export { Polygon };

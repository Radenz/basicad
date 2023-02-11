import type { Transform } from "../geometry/transform";
import { Vector2 } from "../geometry/vector";
import { Vertex } from "../geometry/vertex";
import { Shape } from "./shape";

class Polygon extends Shape {
  constructor(transform: Transform) {
    super(transform);
  }

  get data() {
    if (this.needUpdate) {
      const triangles = this.triangulate();
      triangles.forEach((t) => {
        console.log(t.position.x, t.position.y);
      });
      this.dataCache = triangles.map((v) => v.data).flat();
    }
    this.needUpdate = false;
    return this.dataCache;
  }

  update() {
    this.needUpdate = true;
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
    console.log(this._vertices);
  }

  triangulate(): Vertex[] {
    const vertices = [...this._vertices];
    let convexVertices = Polygon.convexHull(vertices);
    const triangles = [];
    while (vertices.length > 3) {
      const earIndex = Polygon.findEar(vertices, convexVertices);

      const vertex1 =
        vertices[(earIndex - 1 + vertices.length) % vertices.length];
      const vertex2 = vertices[earIndex];
      const vertex3 = vertices[(earIndex + 1) % vertices.length];

      triangles.push(vertex1, vertex2, vertex3);
      vertices.splice(earIndex, 1);
      convexVertices = Polygon.convexHull(vertices);
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
    const triangleArea = Polygon.doubleTriangleArea(vertex1, vertex2, vertex3);
    const area1 = Polygon.doubleTriangleArea(point, vertex1, vertex2);
    const area2 = Polygon.doubleTriangleArea(point, vertex2, vertex3);
    const area3 = Polygon.doubleTriangleArea(point, vertex3, vertex1);
    const totalArea = area1 + area2 + area3;

    return (
      Math.abs(triangleArea - totalArea) < Number.EPSILON &&
      // Stacking vertex workaround
      triangleArea - totalArea != 0
    );
  }

  static doubleTriangleArea(a: Vector2, b: Vector2, c: Vector2) {
    return Math.abs(a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
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
  }

  drawMode(context: WebGLRenderingContext): number {
    // return context.TRIANGLE_FAN;
    return context.TRIANGLES;
  }
}

export { Polygon };

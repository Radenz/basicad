import { Color } from "./color";
import { Transform } from "./geometry/transform";
import { Vector2, Vector3 } from "./geometry/vector";
import type { Vertex } from "./geometry/vertex";
import { Line } from "./shape/line";
import { Polygon } from "./shape/polygon";
import { Rectangle } from "./shape/rectangle";
import type { Shape } from "./shape/shape";
import { Square } from "./shape/square";
import {
  B,
  CLEAR_COLOR,
  COLOR_SIZE,
  FLOAT_SIZE,
  G,
  type Nullable,
  ORANGE,
  PARENT_POSITION_INDEX,
  PARENT_ROTATION_INDEX,
  PARENT_SCALE_INDEX,
  POINT_RADIUS,
  POSITION_SIZE,
  R,
  VERTEX_SIZE,
} from "./util";

type ViewMode = "solid" | "wireframe";
type Mode = "object" | "edit";

class Viewer {
  private context: WebGLRenderingContext;
  private shapes: Shape[];
  private viewMode: ViewMode = "solid";
  private mode: Mode = "object";
  private selected: Nullable<Shape> = null;

  constructor(canvas: HTMLCanvasElement) {
    // TODO: Try other contex, add guard
    this.context = canvas.getContext("webgl")!;
    this.shapes = [];
    this.context.viewport(0, 0, canvas.width, canvas.height);
    this.setup().then(this.start.bind(this));
  }

  async setup() {
    this.context.clearColor(CLEAR_COLOR.x, CLEAR_COLOR.y, CLEAR_COLOR.z, 1.0);

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

    console.log(this.context.getShaderInfoLog(vertexShader));
    console.log(this.context.getShaderInfoLog(fragmentShader));

    this.context.useProgram(program);
    // console.log(this.context.getProgramInfoLog(program));
  }

  setupEventListeners() {
    // TODO: implement
  }

  start() {
    // TODO: Support vendor specific
    window.requestAnimationFrame(this.render.bind(this));
  }

  render() {
    this.context.clear(this.context.COLOR_BUFFER_BIT);
    for (const shape of this.shapes) {
      if (shape.isHidden) continue;

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
      }

      if (this.viewMode === "wireframe") {
        this.drawOutline(data, shape, Color.black);
        shape.vertices.forEach((vertex) => this.drawPoint(vertex, Color.black));
      }

      if (shape.isHighlighted) {
        this.drawOutline(data, shape, ORANGE);
        shape.vertices.forEach((vertex) => this.drawPoint(vertex, ORANGE));
      }
    }

    window.requestAnimationFrame(this.render.bind(this));
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

  select(object: Nullable<Shape>) {
    for (const shape of this.shapes) {
      shape.isHighlighted = shape === object;
    }
  }
  switchViewMode() {
    this.viewMode = this.viewMode === "solid" ? "wireframe" : "solid";
  }
  switchMode() {
    if (this.mode === "object") {
      if (this.selected === null) return;
      this.mode = "edit";
      return;
    }
    this.mode = "object";
  }

  createSquare(transform: Transform, size: number): Square {
    const square = new Square(transform, size);
    this.shapes.push(square);
    return square;
  }

  createLine(transform: Transform, length: number): Line {
    const line = new Line(transform, length);
    this.shapes.push(line);
    return line;
  }

  createRectangle(
    transform: Transform,
    length: number,
    width: number
  ): Rectangle {
    const rect = new Rectangle(transform, length, width);
    this.shapes.push(rect);
    return rect;
  }

  createPolygon(transform: Transform): Polygon {
    const p = new Polygon(transform);
    this.shapes.push(p);
    return p;
  }
  createDefaultPolygon(): Polygon {
    const p = new Polygon(Transform.origin);
    this.shapes.push(p);
    return p;
  }
}

export { Viewer };

import { Color } from "./color";
import { Transform } from "./geometry/transform";
import { Viewer } from "./viewer";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
  const viewer = new Viewer(canvas);

  const sq = viewer.createSquare(Transform.origin, 0.25);
  sq.vertices[1].color = Color.red;
  sq.vertices[2].color = Color.blue;
  sq.vertices[3].color = Color.green;
  sq.size = 0.25;

  const ln = viewer.createLine(Transform.origin, 0.4);
  const rect = viewer.createRectangle(Transform.origin, 0.6, 0.2);

  window["sq"] = sq;
  window["ln"] = ln;
  window["rect"] = rect;
  window["viewer"] = viewer;
});

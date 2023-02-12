import { Color } from "./color";
import { Transform } from "./geometry/transform";
import { Viewer } from "./viewer";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
  const viewer = new Viewer(canvas);

  // const sq = viewer.createSquare(Transform.origin, 0.25);
  // sq.vertices[1].color = Color.red;
  // sq.vertices[2].color = Color.blue;
  // sq.vertices[3].color = Color.green;
  // sq.size = 0.25;

  // const ln = viewer.createLine(Transform.origin, 0.4);
  // const rect = viewer.createRectangle(Transform.origin, 0.6, 0.2);

  // window["sq"] = sq;
  // window["ln"] = ln;
  // window["rect"] = rect;
  // window["viewer"] = viewer;

  setupButtons(viewer);
});

function setupButtons(viewer: Viewer) {
  const solidViewButton = document.getElementById("solid");
  const wireframeViewButton = document.getElementById("wireframe");

  const newLineButton = document.getElementById("line");
  const newSquareButton = document.getElementById("square");
  const newRectangleButton = document.getElementById("rect");
  const newPolygonButton = document.getElementById("poly");

  const modeDisplay = document.getElementById("mode");

  viewer.onModeChanged = (mode) => {
    console.log("mode");
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

  newSquareButton.addEventListener("click", () => {
    viewer.createDefaultSquare();
  });

  newRectangleButton.addEventListener("click", () => {
    viewer.createDefaultRectangle();
  });

  newPolygonButton.addEventListener("click", () => {
    viewer.createDefaultPolygon();
  });
}

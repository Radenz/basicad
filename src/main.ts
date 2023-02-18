import { Polygon } from "./shape/polygon";
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
  window["viewer"] = viewer;
  window["Polygon"] = Polygon;

  setupButtons(viewer);

  const objectList = document.getElementById("object-list");
  viewer.onShapeListChanged((objects) =>
    window.requestAnimationFrame(() => {
      objectList.innerHTML = "";
      objects.forEach((object) => {
        const li = document.createElement("li");
        li.innerText = object.name;
        li.style.cursor = "pointer";
        li.style.color = "blue";
        li.style.textDecoration = "underline";
        li.addEventListener("click", () => {
          viewer.select(object);
        });
        objectList.appendChild(li);
      });
    })
  );
});

function setupButtons(viewer: Viewer) {
  const solidViewButton = document.getElementById("solid");
  const wireframeViewButton = document.getElementById("wireframe");

  const newLineButton = document.getElementById("line");
  const newSquareButton = document.getElementById("square");
  const newRectangleButton = document.getElementById("rect");
  const newPolygonButton = document.getElementById("poly");

  const subdivButton = document.getElementById("mod-subdiv");
  const bevelButton = document.getElementById("mod-bevel");
  const triangulateButton = document.getElementById("mod-tri");

  const modeDisplay = document.getElementById("mode");

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

    viewer.currentObject.subdivide(2);
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
}

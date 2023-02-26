import { Color } from "./color";
import { Line } from "./shape/line";
import { Polygon } from "./shape/polygon";
import { Rectangle } from "./shape/rectangle";
import { Shape } from "./shape/shape";
import { Square } from "./shape/square";
import { Viewer } from "./viewer";

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

import { Color } from "./color";
import { Vector3 } from "./geometry/vector";

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

const CLEAR_COLOR = new Vector3(0.5, 0.5, 0.5);
const DEFAULT_SHAPE_COLOR = Color.rgb(64, 64, 64);
const ORANGE = new Vector3(1, 0.568, 0);

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

export {
  Nullable,
  Listener,
  FPS,
  POINT_RADIUS,
  ORIGIN_CURSOR_RADIUS,
  LINE_CLICK_RANGE,
  FLOAT_SIZE,
  POSITION_SIZE,
  COLOR_SIZE,
  PARENT_POSITION_INDEX,
  PARENT_ROTATION_INDEX,
  PARENT_SCALE_INDEX,
  VERTEX_SIZE,
  R,
  G,
  B,
  FRAME_DELTA_TIME,
  CLEAR_COLOR,
  ORANGE,
  DEFAULT_SHAPE_COLOR,
  onNextFrame,
};

/**
Memory layout:
0000-0008: vPosition        [8 bytes,  2 floats]
0008-0014: vColor           [12 bytes, 3 floats]
0014-001C: vParentPosition  [8 bytes,  2 floats]
001C-0020: vParentRotation  [4 bytes,  1 float]
0020-0024: vParentScale     [4 bytes,  1 float]

Vertex size: (36 bytes)
*/

attribute vec2 vPosition;
attribute vec3 vColor;
attribute vec2 vParentPosition;
attribute float vParentRotation;
attribute float vParentScale;

varying vec4 fColor;

// vec2 rotate(in vec2 position, in float angle) {
//   return mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * position;
// }

mat4 vecScaleMatrix(in float factor) {
  return mat4(
    factor, 0, 0, 0,
    0, factor, 0, 0,
    0, 0, 0, factor,
    0, 0, 0, 0
  );
}

mat4 vecRotationMatrix(in float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat4(
    c, s, 0, 0,
    -s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 0
  );
}

void main() {
  // To representation
  // Vec
  vec4 position = vec4(vPosition, 0, 0);
  // Point
  vec4 parentPosition = vec4(vParentPosition, 0, 1);

  // Scale
  vec4 scaled = vecScaleMatrix(vParentScale) * position;

  // Rotate
  vec4 rotated = vecRotationMatrix(vParentRotation) * scaled;

  // Translate
  vec4 finalPosition = rotated + parentPosition;

  // vec2 position = vParentPosition + rotate(vPosition * vParentScale, vParentRotation);
  gl_Position = finalPosition;
  fColor = vec4(vColor, 1);
}
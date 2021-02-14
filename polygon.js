// function multiplyMatrix(matA, matB){
//   const out = []
//   for (let i = 0; i < 3; ++i) {
//     for (let j = 0; j < 3; ++j) {
//       let temp = 0
//       for (let k = 0; k < 3; ++k) {
//         temp += matA[i*3 + k] * matB[k*3 + j]
//       }
//       out.push(temp)
//     }
//   }
//   return out
// }
// function addMatrix(matA, matB){
//   const out = []
//   for (let i = 0; i < matA.length; i++) {
//     out.push(matA[i] + matB[i])
//   }
//   return out
// }

var canvas = document.getElementById('webgl-app')
canvas.width = 800
canvas.height = 600
var gl = canvas.getContext('webgl2')
if (!gl) {
  alert('Your browser does not support WebGL')
}
gl.clearColor(1,1,1,1)
gl.clear(gl.COLOR_BUFFER_BIT)
var triangleData = [
  0.0, 0.0,
  1.0, 0.0,
  0.0, 1.0
]

var vert = document.getElementById('vert').innerText
var frag = document.getElementById('frag').innerText

// const [u,v] = [-0.12,0];
// const translateMat = [
//   1, 0, 0,
//   0, 1, 0,
//   u, v, 1
// ]
// let degrees = 270;
// const rad = degrees * Math.PI / 180;
// const sin = Math.sin(rad)
// const cos = Math.cos(rad)
// const rotationMat = [
//   cos, -sin, 0,
//   sin, cos, 0,
//   0, 0, 1
// ]
// const [k1, k2] = [0.25,0.25]
// const scaleMat = [
//   k1, 0, 0,
//   0, k2, 0,
//   0, 0, 1
// ]
// const projectionMat = multiplyMatrix(multiplyMatrix(rotationMat, scaleMat), translateMat)
var vertShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertShader, vert)
gl.compileShader(vertShader)
if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
  alert('Error when compiling shaders: ' + gl.getShaderInfoLog(vertShader))
}
var fragShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(fragShader, frag)
gl.compileShader(fragShader)
if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
  alert('Error when compiling shaders: ' + gl.getShaderInfoLog(fragShader))
}
var shaderProgram = gl.createProgram()
gl.attachShader(shaderProgram, vertShader)
gl.attachShader(shaderProgram, fragShader)
gl.linkProgram(shaderProgram)


// TEST
const width = 250;
const height = 250;

// Random points
const points = Array.from({ length: 7 }, () =>
  ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 })
);

// Get the center (mean value) using reduce
const center = points.reduce((acc, { x, y }) => {
  acc.x += x / points.length;
  acc.y += y / points.length;
  return acc;
}, { x: 0, y: 0 });

// Add an angle property to each point using tan(angle) = y/x
const angles = points.map(({ x, y }) => {
  return { x, y, angle: Math.atan2(y - center.y, x - center.x) * 180 / Math.PI };
});

// Sort your points by angle
const pointsSorted = angles.sort((a, b) => a.angle - b.angle);
console.log(points)
console.log(pointsSorted)

var polygonData = []
for (var point in pointsSorted) {
  polygonData.push(pointsSorted[point].x)
  polygonData.push(pointsSorted[point].y)
}
console.log(polygonData)
var indices = []
for (var i = 0; i < pointsSorted.length - 2; i++) {
  indices.push([0, i+1, i+2])
}
for (var index in indices) {
  triangleData = []
  triangleData.push(polygonData[indices[index][0] * 2])
  triangleData.push(polygonData[indices[index][0] * 2 + 1])
  triangleData.push(polygonData[indices[index][1] * 2])
  triangleData.push(polygonData[indices[index][1] * 2 + 1])
  triangleData.push(polygonData[indices[index][2] * 2])
  triangleData.push(polygonData[indices[index][2] * 2 + 1])
  console.log(triangleData)
  

  var vertBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleData), gl.STATIC_DRAW)


  gl.useProgram(shaderProgram) // always use the program on the beginning
  var vertexPos = gl.getAttribLocation(shaderProgram, 'a_pos')
  var uniformCol = gl.getUniformLocation(shaderProgram, 'u_fragColor')
  // var uniformPos = gl.getUniformLocation(shaderProgram, 'u_proj_mat')
  gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0)
  // gl.uniformMatrix3fv(uniformPos, false, projectionMat)
  gl.uniform4fv(uniformCol, [1.0, 0.0, 0.0, 1.0])
  gl.enableVertexAttribArray(vertexPos)
  gl.drawArrays(gl.TRIANGLES, 0, triangleData.length/2)
}
// END TEST
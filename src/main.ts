import { multiplyMatrix } from './utils/matrix'

var canvas = document.getElementById('webgl-app') as HTMLCanvasElement
canvas.width = 800
canvas.height = 600
var gl = canvas.getContext('webgl2')
async function main() {
    if (!gl) {
        alert('Your browser does not support WebGL')
        return
    }
    gl.clearColor(1,1,1,1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        console.log('initialized')
        var triangleData = [
        0.1, 0.1,
        1.0, 0.0,
        0.0, 1.0
        ]


        var vert = document.getElementById('vert').innerText
        var frag = document.getElementById('frag').innerText
        console.log(vert);
        const [u,v] = [-0.12,0];
        const translateMat = [
        1, 0, 0,
        0, 1, 0,
        u, v, 1
        ]
        let degrees = 270;
        const rad = degrees * Math.PI / 180;
        const sin = Math.sin(rad)
        const cos = Math.cos(rad)
        const rotationMat = [
        cos, -sin, 0,
        sin, cos, 0,
        0, 0, 1
        ]
        const [k1, k2] = [0.25,0.25]
        const scaleMat = [
        k1, 0, 0,
        0, k2, 0,
        0, 0, 1
        ]
        const projectionMat = multiplyMatrix(multiplyMatrix(rotationMat, scaleMat), translateMat)
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
        var vertBuf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleData), gl.STATIC_DRAW)


        gl.useProgram(shaderProgram) // always use the program on the beginning
        var vertexPos = gl.getAttribLocation(shaderProgram, 'a_pos')
        var uniformCol = gl.getUniformLocation(shaderProgram, 'u_fragColor')
        var uniformPos = gl.getUniformLocation(shaderProgram, 'u_proj_mat')
        gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0)
        gl.uniformMatrix3fv(uniformPos, false, projectionMat)
        gl.uniform4fv(uniformCol, [1.0, 0.0, 0.0, 1.0])
        gl.enableVertexAttribArray(vertexPos)
        gl.drawArrays(gl.TRIANGLES, 0, triangleData.length/2)
}

main()
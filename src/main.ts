import { multiplyMatrix } from './utils/matrix'
import { fetchShader } from './loaders/shader'
import GLObject from './GLObject'
import Renderer from './renderer'



var canvas = document.getElementById('content') as HTMLCanvasElement
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


    var vert = await fetchShader('draw-vert.glsl')
    var frag = await fetchShader('draw-frag.glsl')
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

    // GLObject instantiation
    const glObject = new GLObject(0, shaderProgram, gl)
    glObject.setVertexArray(triangleData)
    glObject.setPosition(0,0)
    glObject.setRotation(0)
    glObject.setScale(1,1)
    glObject.bind()


    const glObject2 = new GLObject(0, shaderProgram, gl)
    glObject2.setVertexArray(triangleData)
    glObject2.setPosition(0,0)
    glObject2.setRotation(180)
    glObject2.setScale(1,1)
    glObject2.bind()


    const renderer = new Renderer()
    renderer.addObject(glObject)
    renderer.addObject(glObject2)
    renderer.render()
}

main()
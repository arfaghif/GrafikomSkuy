import { multiplyMatrix } from './utils/matrix'
import { fetchShader } from './loaders/shader'
import GLObject from './GLObject'
import Renderer from './renderer'

var canvas = document.getElementById('content') as HTMLCanvasElement
canvas.width = 800
canvas.height = 600
var gl = canvas.getContext('webgl2')

let appState = {
    mousePos : {
        x: 0,
        y: 0
    }
}
async function main() {
    canvas.addEventListener('mousemove', (event) => {
        const bound = canvas.getBoundingClientRect()
        const res = {
            x: event.clientX - bound.left,
            y: event.clientY - bound.top
        }
        appState.mousePos = res
    }, false)
    
    if (!gl) {
        alert('Your browser does not support WebGL')
        return
    }
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    console.log('initialized')
    var lineData = [
        400, 400,
        500, 500,
    ]
    
    var squareData = [
        -100, -100,
        100, 100
    ]
    
    var triangleData = [
        400, 400,
        400, 200,
        200, 400
    ]
    
    
    var vert = await fetchShader('draw-vert.glsl')
    var frag = await fetchShader('draw-frag.glsl')
    
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
    gl.useProgram(shaderProgram)
    
    // convert clip space to pixel space
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    const u_resolution = gl.getUniformLocation(shaderProgram, 'u_resolution')
    gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height)
    
    // GLObject instantiation
    const glObject = new GLObject(0, shaderProgram, gl, "square")
    glObject.setVertexArray(squareData)
    glObject.setPosition(300,300)
    glObject.setRotation(0)
    glObject.setScale(1,1)
    glObject.bind()
    
    
    const glObject2 = new GLObject(1, shaderProgram, gl, "line")
    glObject2.setVertexArray(squareData)
    glObject2.setPosition(300, 300)
    glObject2.setRotation(180)
    glObject2.setScale(2, 2)
    glObject2.bind()
    
    // const glObject3 = new GLObject(0, shaderProgram, gl, "triangle")
    // glObject3.setVertexArray(triangleData)
    // glObject3.setPosition(0,0)
    // glObject3.setRotation(0)
    // glObject3.setScale(1,1)
    // glObject3.bind()
    
    
    const renderer = new Renderer()
    renderer.addObject(glObject)
    renderer.addObject(glObject2)
    // renderer.addObject(glObject3)
    
    // using the texture and depth buffer with frame buffer
    function render(now: number) {
        renderer.render()
        requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
}

main()
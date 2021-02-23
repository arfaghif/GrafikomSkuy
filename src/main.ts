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
        200, 400,
        400, 200
    ]

    var triangleData = [
        400, 400,
        400, 200,
        200, 400
    ]


    var vert = await fetchShader('draw-vert.glsl')
    var frag = await fetchShader('draw-frag.glsl')
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

    var selectVert = await fetchShader('select-vert.glsl')
    var selectFrag = await fetchShader('select-frag.glsl')
    
    var selectVertShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(selectVertShader, selectVert)
    gl.compileShader(selectVertShader)
    if (!gl.getShaderParameter(selectVertShader, gl.COMPILE_STATUS)) {
        alert('Error when compiling shaders: ' + gl.getShaderInfoLog(selectVertShader))
    }
    var selectFragShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(selectFragShader, selectFrag)
    gl.compileShader(selectFragShader)
    if (!gl.getShaderParameter(selectFragShader, gl.COMPILE_STATUS)) {
        alert('Error when compiling shaders: ' + gl.getShaderInfoLog(selectFragShader))
    }
    var selectProgram = gl.createProgram()
    gl.attachShader(selectProgram, selectVertShader)
    gl.attachShader(selectProgram, selectFragShader)
    gl.linkProgram(selectProgram)

    gl.useProgram(shaderProgram)
    
    // convert clip space to pixel space
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    const u_resolution = gl.getUniformLocation(shaderProgram, 'u_resolution')
    gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height)

    // GLObject instantiation
    const glObject = new GLObject(0, shaderProgram, gl, "square")
    glObject.setVertexArray(squareData)
    glObject.setPosition(0,0)
    glObject.setRotation(0)
    glObject.setScale(1,1)
    glObject.bind()


    const glObject2 = new GLObject(1, shaderProgram, gl, "line")
    glObject2.setVertexArray(squareData)
    glObject2.setPosition(700, 500)
    glObject2.setRotation(180)
    glObject2.setScale(1,1)
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
    
    // defining texture buffer    
    const texBuf = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texBuf)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

// defining depth buffer
    const depBuf = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, depBuf)
    function setFrameBufferAttatchmentSizes(width: number, height: number) {
        gl.bindTexture(gl.TEXTURE_2D, texBuf)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, depBuf)
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
    }
    setFrameBufferAttatchmentSizes(gl.canvas.width, gl.canvas.height)

// defining frame buffer
    const frameBuf = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuf)
    const attachmentPoint = gl.COLOR_ATTACHMENT0
    const lvl = 0

// using the texture and depth buffer with frame buffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texBuf, lvl)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depBuf)
    function render(now: number) {
        gl.clearColor(1,1,1,1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.viewport(0,0, gl.canvas.width, gl.canvas.height)
        // drawing texture
        const frameBuffer = frameBuf
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
        gl.enable(gl.DEPTH_TEST)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.useProgram(selectProgram)
        const resolutionPos = gl.getUniformLocation(selectProgram, 'u_resolution')
        gl.uniform2f(resolutionPos, gl.canvas.width, gl.canvas.height)
        renderer.renderTex(selectProgram)
        // getting the pixel value
        const pixelX = appState.mousePos.x * gl.canvas.width / canvas.clientWidth
        const pixelY = gl.canvas.height - appState.mousePos.y * gl.canvas.height / canvas.clientHeight - 1
        const data = new Uint8Array(4)
        gl.readPixels(pixelX, pixelY, 1,1, gl.RGBA, gl.UNSIGNED_BYTE, data)
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24)
        console.log(id)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        // draw the actual objects
        gl.useProgram(shaderProgram)
        renderer.render()
        // requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
    // renderer.render()
}

main()
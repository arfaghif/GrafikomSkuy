import { multiplyMatrix } from './utils/matrix'
import { fetchShader, fetchSavedData } from './loaders/shader'
import GLObject from './GLObject'
import Renderer from './renderer'

var canvas = document.getElementById('content') as HTMLCanvasElement
canvas.width = 800
canvas.height = 600
var gl = canvas.getContext('webgl2')
var renderer;
var pixelTolerance = 5

var points = []
var pressedKeys = {}
var drawingType = ""
var objects = [
    {
        type: 'square',
        points: [
            30, 30,
            10, 10
        ]
    },
    {
        type: 'line',
        points: [
            200, 200,
            220, 220,
        ]
    }
]

function changeType(type) {
    drawingType = type;
    points = []
    console.log(drawingType)
}

document.getElementById("lineButton").onclick = function() {
    changeType("line")
}
document.getElementById("squareButton").onclick = function() {
    changeType("square")
}
document.getElementById("polygonButton").onclick = function() {
    changeType("polygon")
}
document.getElementById("clearButton").onclick = function() {
    objects = []
    points= []
    renderer.clearObject()
    main()
}
document.getElementById("saveButton").onclick = function() {
    let data = JSON.stringify(objects);
    document.getElementById("textarea").innerText = data

}
document.getElementById("loadButton").onclick = function() {
    let objectString = document.getElementById("textarea").value
    try {
        objects = JSON.parse(objectString)
    } catch {
        alert('Failed to parse JSON')
    }
    main()
}

function inputCanvasCoordinates(event, canvas) {
    var x = event.clientX,
    y = event.clientY,
    rect = event.target.getBoundingClientRect();
    x = x - rect.left;
    y = rect.bottom - y;
    return {x:x,y:y};
}

function onmousedown(event) {
    if (pressedKeys[16]) {
        var point = inputCanvasCoordinates(event, canvas);
        var pixels = new Uint8Array(4);
        gl.readPixels(point.x, point.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        console.log(point.x, point.y);
    }
    else {
        var point = inputCanvasCoordinates(event, canvas);
        points.push(point.x)
        points.push(point.y)
        console.log(points)
        if (drawingType === "line" && points.length == 4) {
            objects.push({
                type: 'line',
                points: points
            })
            points = []
        } else if (drawingType === "square" && points.length == 4) {
            objects.push({
                type: 'square',
                points: points
            })
            points = []
        } else if (drawingType === "polygon" && points.length > 2 && Math.abs(points[0] - points[points.length - 2]) <= pixelTolerance && Math.abs(points[1] - points[points.length - 1]) <= pixelTolerance) { // first === last point
            objects.push({
                type: 'polygon',
                points: points
            })
            points = []
        }
        console.log(objects)
        main()
    }
}

function keyDown(event) {
    pressedKeys[event.keyCode] = true;
}

function keyUp(event) {
    pressedKeys[event.keyCode] = false;
}

async function main() {
    canvas.addEventListener('mousedown', onmousedown);
    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
    
    if (!gl) {
        alert('Your browser does not support WebGL')
        return
    }
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    console.log('initialized')
    
    
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
    renderer = new Renderer()
    console.log(objects)
    objects.forEach(object => {
        const glObject = new GLObject(0, shaderProgram, gl, object.type)
        glObject.setVertexArray(object.points)
        glObject.setPosition(0, 0)
        glObject.setRotation(0)
        glObject.setScale(1,1)
        glObject.bind()
        renderer.addObject(glObject)
    });

    for (var i = 0; i < points.length; i += 2) {
        const glObject = new GLObject(0, shaderProgram, gl, "square")
        var pointsVa = [points[i], points[i+1], points[i] - pixelTolerance, points[i+1] - pixelTolerance]
        glObject.setVertexArray(pointsVa)
        glObject.setPosition(0, 0)
        glObject.setRotation(0)
        glObject.setScale(1,1)
        glObject.bind()
        renderer.addObject(glObject)
    }

    renderer.render()
}



main()
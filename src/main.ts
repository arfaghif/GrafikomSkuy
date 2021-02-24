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

var mousePressed = false
var selectedPoint = [-1, -1]    // object index, point index * 2
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
    document.getElementById("currentDraw").innerText = type
    main()
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
    points = []
    renderer.clearObject()
    main()
}
document.getElementById("saveButton").onclick = function() {
    let data = JSON.stringify(objects);
    document.getElementById("textarea").value = data

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
    var point = inputCanvasCoordinates(event, canvas);
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].type === "polygon" || objects[i].type === "line") {
            for (var j = 0; j < objects[i].points.length; j += 2) {
                // polygon or line
                if (Math.abs(objects[i].points[j] - point.x) <= pixelTolerance && Math.abs(objects[i].points[j + 1] - point.y) <= pixelTolerance) {
                    selectedPoint = [i, j]
                    break
                }
            }
        } else {
            var dist = Math.max(Math.abs(objects[i].points[2] - objects[i].points[0]), Math.abs(objects[i].points[3] - objects[i].points[1]))
            var x1 = objects[i].points[0] - dist
            var y1 = objects[i].points[1] - dist
            var x2 = objects[i].points[0] + dist
            var y2 = objects[i].points[1] + dist
            // infer titik sudut dari titik pusat dan distance, grab titik sudut
            if (Math.abs(x1 - point.x) <= pixelTolerance && Math.abs(y1 - point.y) <= pixelTolerance) {
                selectedPoint = [i, 0]
                break
            }
            if (Math.abs(x1 - point.x) <= pixelTolerance && Math.abs(y2 - point.y) <= pixelTolerance) {
                selectedPoint = [i, 0]
                break
            }
            if (Math.abs(x2 - point.x) <= pixelTolerance && Math.abs(y1 - point.y) <= pixelTolerance) {
                selectedPoint = [i, 0]
                break
            }
            if (Math.abs(x2 - point.x) <= pixelTolerance && Math.abs(y2 - point.y) <= pixelTolerance) {
                selectedPoint = [i, 0]
                break
            }
        }
        if (selectedPoint[0] != -1) break
    }
    if (selectedPoint[0] == -1) {
        var point = inputCanvasCoordinates(event, canvas);
        points.push(point.x)
        points.push(point.y)
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
            points.pop()
            points.pop()    // remove 2 last points
            objects.push({
                type: 'polygon',
                points: points
            })
            points = []
        }
        // console.log(objects)
        main()
    }
    mousePressed = true
}

function onmouseup(event) {
    mousePressed = false
    selectedPoint = [-1, -1]
}

function onmousemove(event) {
    if (mousePressed == true && selectedPoint[0] != -1) {   // if a point is selected
        var point = inputCanvasCoordinates(event, canvas);
        if (objects[selectedPoint[0]].type === "line" || objects[selectedPoint[0]].type === "polygon") {
            // langsung replace point yang dipilih
            objects[selectedPoint[0]].points[selectedPoint[1]] = point.x
            objects[selectedPoint[0]].points[selectedPoint[1] + 1] = point.y
        } else {    // type square
            // hitung ulang distance, replace point kedua pada square
            var dist = Math.max(Math.abs(point.x - objects[selectedPoint[0]].points[0]), Math.abs(point.y - objects[selectedPoint[0]].points[1]))
            objects[selectedPoint[0]].points[2] = objects[selectedPoint[0]].points[0] + dist
            objects[selectedPoint[0]].points[3] = objects[selectedPoint[0]].points[1] + dist
        }
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
    canvas.addEventListener('mousemove', onmousemove);
    canvas.addEventListener('mouseup', onmouseup);
    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
    
    if (!gl) {
        alert('Your browser does not support WebGL')
        return
    }
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    
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
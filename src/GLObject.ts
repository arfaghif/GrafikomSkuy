// GLObject.ts
import { multiplyMatrix } from './utils/matrix'

class GLObject {
    public id: number;
    public va: number[];
    public shader: WebGLProgram;
    public pos: [number, number];
    public rot: number;
    public scale: [number, number];
    public gl: WebGL2RenderingContext;
    public projectionMat: number[];
    public type: string;
    public vbo;
    
    constructor(id: number, shader: WebGLProgram, gl: WebGL2RenderingContext, type: string) {
        this.id = id;
        this.shader = shader;
        this.gl = gl;
        this.type = type;
    }
    setVertexArray(va: number[]) {
        if (this.type === "line" || this.type === "polygon") {
            this.va = va;
        } else if (this.type === "square") {
            this.va = this.getSquareVa(va[0], va[1], va[2], va[3]);
        }
    }
    
    
    setPosition(x: number, y: number) {
        this.pos = [x,y];
        this.projectionMat = this.calcProjectionMatrix()
    }
    
    
    setRotation(rot: number) {
        this.rot = rot;
        this.projectionMat = this.calcProjectionMatrix()
    }
    
    
    setScale(x: number, y:number) {
        this.scale = [x,y];
        this.projectionMat = this.calcProjectionMatrix()
    }
    
    
    calcProjectionMatrix() {
        if (this.pos === undefined || this.rot === undefined || this.scale === undefined) return null
        const [u,v] = this.pos
        const translateMat = [
            1, 0, 0,
            0, 1, 0,
            u, v, 1
        ]
        const degrees = this.rot;
        const rad = degrees * Math.PI / 180;
        const sin = Math.sin(rad)
        const cos = Math.cos(rad)
        const rotationMat = [
            cos, -sin, 0,
            sin, cos, 0,
            0, 0, 1
        ]
        const [k1, k2] = this.scale
        const scaleMat = [
            k1, 0, 0,
            0, k2, 0,
            0, 0, 1
        ]
        const projectionMat = multiplyMatrix(multiplyMatrix(rotationMat, scaleMat), translateMat)
        return projectionMat
    }
    bind() {
        const gl = this.gl
        const vbo = gl.createBuffer()
        this.vbo = vbo
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.va), gl.STATIC_DRAW)
    }
    
    getSquareVa(u1, v1, u2, v2){
        var dist = Math.max(Math.abs(u2 - u1), Math.abs(v2 - v1))
        var x1 = u1 - dist
        var y1 = v1 - dist
        var x2 = u1 + dist
        var y2 = v1 + dist
        return [x1,y1,x1,y2,x2,y2,x1,y1,x2,y1,x2,y2]
    }
    
    draw() {
        const gl = this.gl
        gl.useProgram(this.shader)
        var vertexPos = gl.getAttribLocation(this.shader, 'a_pos')
        var uniformCol = gl.getUniformLocation(this.shader, 'u_fragColor')
        var uniformPos = gl.getUniformLocation(this.shader, 'u_proj_mat')
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)
        gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0)
        gl.uniformMatrix3fv(uniformPos, false, this.projectionMat)
        gl.uniform4fv(uniformCol, [1.0, 0.0, 0.0, 1.0]) // for coloring
        gl.enableVertexAttribArray(vertexPos)
        if (this.type === "line") {
            gl.drawArrays(gl.LINES, 0, 2)
        } else if (this.type === "square") {
            gl.drawArrays(gl.TRIANGLES, 0, 6)
        } else if (this.type === "polygon") {
            gl.drawArrays(gl.TRIANGLE_FAN, 0, this.va.length / 2)
        }
    }
    
}

export default GLObject
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


  constructor(id: number, shader: WebGLProgram, gl: WebGL2RenderingContext) {
      this.id = id;
      this.shader = shader;
      this.gl = gl;

  }
  setVertexArray(va: number[]) {
        this.va = va;
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
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.va), gl.STATIC_DRAW)
  }


  draw() {
      const gl = this.gl
      gl.useProgram(this.shader)
      var vertexPos = gl.getAttribLocation(this.shader, 'a_pos')
      var uniformCol = gl.getUniformLocation(this.shader, 'u_fragColor')
      var uniformPos = gl.getUniformLocation(this.shader, 'u_proj_mat')
      gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0)
      gl.uniformMatrix3fv(uniformPos, false, this.projectionMat)
      gl.uniform4fv(uniformCol, [1.0, 0.0, 0.0, 1.0])
      gl.enableVertexAttribArray(vertexPos)
      gl.drawArrays(gl.TRIANGLES, 0, this.va.length/2)
  }
// ...

}

export default GLObject
export const loadShader = async (gl: WebGL2RenderingContext, type: number, source: string) => {
    const rawShader = await fetchShader(source)
    const shader = gl.createShader(type)
    gl.shaderSource(shader, rawShader)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('Error when compiling shaders: ' + gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
    }
    return shader
}


export async function fetchShader(source: string) {
    const shader = await fetch('/shaders/' + source).then(res => res.text())
    return shader
}

export async function initShaderFiles(gl: WebGL2RenderingContext, vert: string, frag: string) {
    const vs = await loadShader(gl, gl.VERTEX_SHADER, vert)
    const fs = await loadShader(gl, gl.FRAGMENT_SHADER, frag)
    const shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vs)
    gl.attachShader(shaderProgram, fs)
    gl.linkProgram(shaderProgram)
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Error on initializing shader program: ' + gl.getProgramInfoLog(shaderProgram))
        return null
    }
    return shaderProgram
}
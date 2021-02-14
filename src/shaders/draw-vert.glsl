attribute vec2 a_pos;
uniform mat3 u_proj_mat;

void main() {
    vec2 position = (u_proj_mat * vec3(a_pos, 1)).xy;
    gl_Position = vec4(position, 0, 1);
}
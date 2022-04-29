//we have a default vertex attribute vec2 uv
//if we have to pass this vertex shader attribute to
//fragment shader

//varying vec2 vertexUV;
//varying vec3 vertexNormal;

//represents every vertex on the globe
//https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram


// example triangle matrix =
// [-1, 0, 0,
//  0, 1, 0, 
//  1, 0, 0] 

//projection matrix is mat4 and modelViewMatrix a;so mat4 (4*4 matrix)
// vec4(position, 1.0) === vec4(1, 0, 0, 1.0)
//position* vec3(2,2,1) === vec3(1,0,0) vec3(2,2,1))
//x = 1*2=2
//y =0*2=0
//z=0*1=0
//position = vec(2,0,0)

//takeaway is to use the boiler plate code for shader to work
 
const Vertex = `
//uniform sampler2D globeTexture;
void main(){
 
    vertexUV = uv;
vertexNormal = normalize(normalMatrix * normal);
    //modelmatrix, view matrix,projection matrix are matrix data types
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`
export default Vertex

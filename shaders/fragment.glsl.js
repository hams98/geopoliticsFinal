// pass our texture through uniform(from js to shader)
// https://thebookofshaders.com/


const Fragment = `
// paste from vertex shader
varying vec2 vertexUV;

// how we get vertex normal data
varying vec3 vertexNormal;
uniform sampler2D globeTexture;

void main(){
    //grb values and alpha(transparency)
    // second argument is a UV coordinate
    //uv coordinate is x,y coordinate [0,0]

    //uv mapping is the process of mapping a 2d
    // image onto a 3d object
    //u and v represents the axes of the 2d texture
    // because x,y and z are taken
    // also called texture coordinates


   
   


   // second argument is coordinates
   
  // texture2D(globeTexture, vertexUV );
  //vec4(1, 0, 0, 1); replace this with above
  // vec 3 for tint

  // some playing around for the atmosphere
  //normal is data that represents the direction a vertex is facing
  //different kinds of vertex data: position, normal, UV
  //[1,0,0] means vertex is pointing towards the right
  float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
  vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);

  gl_FragColor = vec4(atmosphere +texture2D(globeTexture, vertexUV).xyz, 1.0);
  
  // create an atmosphere add a .xyz property
  
}`
export default Fragment

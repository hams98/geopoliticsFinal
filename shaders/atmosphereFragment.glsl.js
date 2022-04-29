varying vec3 vertexNormal;

uniform sampler2D globeTexture;
void main(){

  float intensity = pow(0.6- dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 2.0);
  

  gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
  
  // create an atmosphere add a .xyz property
  



}

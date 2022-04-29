//we have a default vertex attribute vec2 uv
//if we have to pass this vertex shader attribute to
//fragment shader


varying vec3 vertexNormal;

void main(){
 

   // normalize(normalMatrix * normal); to make brighness similar
    vertexNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}


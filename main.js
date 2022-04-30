import * as THREE from "/node_modules/three/build/three.module.js


import { Float32BufferAttribute, MeshBasicMaterial } from 'three';
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl.js'
import vertexShader from './shaders/vertex.glsl.js'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl.js'
import fragmentShader from './shaders/fragment.glsl.js'

//console.log(vertexShader)
//console.log(fragmentShader)
//console.log(atmosphereVertexShader)
//console.log(atmosphereFragmentShader)
// rederence: Github: https://github.com/danielblagy/three_mmi

class MouseMeshInteractionHandler {
	constructor(mesh_name, handler_function) {
		this.mesh_name = mesh_name;
		this.handler_function = handler_function;
	}
}

 class MouseMeshInteraction {
	constructor(scene, camera) {
		this.scene = scene;
		this.camera = camera;
		
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		
		this.updated = false;
		this.event = '';
		
		// last mesh that the mouse cursor was over
		this.last_mouseenter_mesh = undefined;
		// last mesh that the mouse was pressing down
		this.last_pressed_mesh = undefined;
		
		this.handlers = new Map();
		
		this.handlers.set('click', []);
		this.handlers.set('dblclick', []);
		this.handlers.set('contextmenu', []);
		
		this.handlers.set('mousedown', []);
		this.handlers.set('mouseup', []);
		this.handlers.set('mouseenter', []);
		this.handlers.set('mouseleave', []);
		
		window.addEventListener('mousemove', this);
		
		window.addEventListener('click', this);
		window.addEventListener('dblclick', this);
		window.addEventListener('contextmenu', this);
		
		window.addEventListener('mousedown', this);
	}
	
	handleEvent(e) {
		switch(e.type) {
			case "mousemove": {
				this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
				this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
				this.updated = true;
				this.event = 'motion';
			}
			break;
			default: {
				this.updated = true;
				this.event = e.type;
			}
		}
	}
	
	addHandler(mesh_name, event_type, handler_function) {
		if (this.handlers.has(event_type)) {
			this.handlers.get(event_type).push(new MouseMeshInteractionHandler(mesh_name, handler_function));
		}
	}
	
	update() {
		if (this.updated) {
			// update the picking ray with the camera and mouse position
			this.raycaster.setFromCamera(this.mouse, this.camera);
			
			// calculate objects intersecting the picking ray
			const intersects = this.raycaster.intersectObjects(this.scene.children, true);
			
			if (intersects.length > 0) {
				// special test for events: 'mouseenter', 'mouseleave'
				if (this.event === 'motion') {
					let mouseenter_handlers = this.handlers.get('mouseenter');
					let mouseleave_handlers = this.handlers.get('mouseleave');
					
					if (mouseleave_handlers.length > 0) {
						for (const handler of mouseleave_handlers) {
							// if mesh was entered by mouse previously, but not anymore, that means it has been mouseleave'd
							if (
								this.last_mouseenter_mesh !== undefined
								&& intersects[0].object !== this.last_mouseenter_mesh
								&& handler.mesh_name === this.last_mouseenter_mesh.name
							) {
								handler.handler_function(this.last_mouseenter_mesh);
								break;
							}
						}
					}
					
					if (mouseenter_handlers.length > 0) {
						for (const handler of mouseenter_handlers) {
							if (handler.mesh_name === intersects[0].object.name && intersects[0].object !== this.last_mouseenter_mesh) {
								this.last_mouseenter_mesh = intersects[0].object;
								handler.handler_function(intersects[0].object);
								break;
							}
						}
					}
				}
				else {
					// if mouseup event has occurred
					if (this.event === 'click' && this.last_pressed_mesh === intersects[0].object) {
						for (const handler of this.handlers.get('mouseup')) {
							if (handler.mesh_name === intersects[0].object.name) {
								handler.handler_function(intersects[0].object);
								break;
							}
						}
						this.last_pressed_mesh = undefined;
					}
					
					// for mouseup event handler to work
					if (this.event === 'mousedown') {
						this.last_pressed_mesh = intersects[0].object;
					}
					
					let handlers_of_event = this.handlers.get(this.event);
					for (const handler of handlers_of_event) {
						if (handler.mesh_name === intersects[0].object.name) {
							handler.handler_function(intersects[0].object);
							break;
						}
					}
				}
			}
			// if mouse doesn't intersect any meshes
			else if (this.event === 'motion') {
				// special test for 'mouseleave' event
				// 			(since it may be triggered when cursor doesn't intersect with any meshes)
				for (const handler of this.handlers.get('mouseleave')) {
					// if mesh was entered by mouse previously, but not anymore, that means it has been mouseleave'd
					if (this.last_mouseenter_mesh !== undefined && handler.mesh_name === this.last_mouseenter_mesh.name) {
						handler.handler_function(this.last_mouseenter_mesh);
						this.last_mouseenter_mesh = undefined;
						break;
					}
				}
			}
			
			this.updated = false;
		}
	}
}
// we have a scene. In Three.js scenes allow you to set up what and where is it being rendered.
const scene = new THREE.Scene();

/* We have to next set up a camera to look at our scene. I have used the Perspective camera which looks at the scene with perspective projection. 
The perspective camera takes 4 arguments
1. amount of visible screen, 2. aspect artio, 3. clipping plane (how close the object needs to be to be clipped out of a scene) */
const camera = new THREE.PerspectiveCamera(75 ,innerWidth /innerHeight, 0.1, 1000)

/* rendered is webgl is the frmework that runs 3D on web
we will be injecting it to out html using javascript */
const renderer = new THREE.WebGLRenderer({
     antialias: true,
     canvas: document.querySelector('canvas')
})

console.log(scene)
console.log(camera)
console.log(renderer)

//automatic 8px margin
renderer.setSize(innerWidth, innerHeight)

// to not have jagged edges
renderer.setPixelRatio(window.devicePixelRatio)
//document.body.appendChild(renderer.domElement)




/* create a sphere (mesh)
Mesh has geometry and shader
Geometry has 3 arguments 1. how big 2. width segments and height segments
We are using a custom shader that I built 
I am using a 2d image of the globe to wrap around the sphere*/

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(10, 100, 100), 
  new THREE.ShaderMaterial({
   vertexShader,
   fragmentShader,
   uniforms:{
     globeTexture: {
      
       value: new THREE.TextureLoader().load('./img/map_uv.jpg')
       
     }
   }
  })
  )
/* 
Creating a new mesh for the atmosphere 
Another custom shader made to look like the atmosphere
The dimensions and location are the same for bothese meshes
*/
 const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(10, 100, 100), 
  new THREE.ShaderMaterial({
   vertexShader: atmosphereVertexShader,
   fragmentShader: atmosphereFragmentShader,
   blending: THREE.AdditiveBlending,
   side: THREE.BackSide
   
  })
  )
 atmosphere.scale.set(1.1,1.1,1.1)
  
 console.log(sphere)
//scene.add(sphere)
scene.add(atmosphere)

//for mouse movement we group the full sphere
const group = new THREE.Group()
group.add(sphere)

scene.add(group)

//For the background stars
const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
  
    color: 0xFFFFFF
  })
//Points
const stars = new THREE.Points(
  starGeometry, starMaterial
)

const starVertices = []
for (let i=0;i<10000;i++){
  const x= (Math.random() - 0.5)*2000
  const y= (Math.random() - 0.5)*2000
  const z= -Math.random()*2000
  starVertices.push(x, y, z)

}
starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starVertices, 3))
console.log(stars)
scene.add(stars)

// The value of this variable determines how far away the camera is greater than our radius of our earth
camera.position.z = 25

//variable for mouse movements
const mouse = {
  x: undefined,
  y: undefined
}



const pins = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5,100,100),
  new THREE.MeshBasicMaterial({color:0xff007f})
) 


//creating meshes for points on the map 

const mesh1 = new THREE.Mesh(
	new THREE.SphereBufferGeometry(0.5,100,100),
	new THREE.MeshBasicMaterial({color:0xff007f})
  )
const mesh2 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5,100,100),
  new THREE.MeshBasicMaterial({color:0xff007f})
)
const mesh3 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5,100,100),
  new THREE.MeshBasicMaterial({color:0xff007f})
)
const mesh4 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5,100,100),
  new THREE.MeshBasicMaterial({color:0xff007f})
)
const mesh5 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5,100,100),
  new THREE.MeshBasicMaterial({color:0xff007f})
)

//writing a function to convert Latitute, Longitude values to Cartasian coordinates

function convertLatLongToCartasian(point){
  let radius = 10
  let lat = (90- point.lat)* (Math.PI/180);
  let lng = (180+point.lng)* (Math.PI/180);

  let x = -(radius*Math.sin(lng)*Math.sin(lat))
  let z = radius*Math.sin(lat)*Math.cos(lng)
  let y = radius*Math.cos(lat)
  return{
    x,y,z
  }
}

//usa
let points1 = {
  lat:45,
  lng:-170

}
//middleeast
let points2 = {
  lat:30,
  lng:45
}
//india-Pak
 let points3 = {
	lat:30,
    lng:20
 }
//russia
let points4 = {
	lat:70,
	lng:10
}
//china
let points5 = {
	lat:40,
	lng:-10
}

let pos1 = convertLatLongToCartasian(points1)
let pos2 = convertLatLongToCartasian(points2)
let pos3 = convertLatLongToCartasian(points3)
let pos4 = convertLatLongToCartasian(points4)
let pos5 = convertLatLongToCartasian(points5)

// setting them on the map





mesh1.name = 'geopin1'
mesh3.name = 'geopin3'
mesh2.name = 'geopin2'
mesh4.name = 'geopin4'
mesh5.name = 'geopin5'



mesh1.position.set(pos1.x,pos1.y,pos1.z)
mesh2.position.set(pos2.x,pos2.y,pos2.z)
mesh3.position.set(pos3.x,pos3.y,pos3.z)
mesh4.position.set(pos4.x,pos4.y,pos4.z)
mesh5.position.set(pos5.x,pos5.y,pos5.z)

sphere.add(mesh1)
sphere.add(mesh3)
sphere.add(mesh2)
sphere.add(mesh4)
sphere.add(mesh5)

const mmi =  new MouseMeshInteraction(scene, camera)
//const mmi1 =  new MouseMeshInteraction(scene, camera)
//pins.name = 'geopin1'




//scene.add(mesh2)
/*scene.add(mesh3)
scene.add(mesh4)
scene.add(mesh5)
 */

//scene.add(pins)



mmi.addHandler('geopin1','click',function(mesh1){
	location.href = 'page2.html'
	});
	
//create a handler for when user clicks on a mesh with the name 'geo-pin1'
mmi.addHandler('geopin3','click', function(mesh3){

location.href = 'page1.html'
}); 

mmi.addHandler('geopin2','click', function(mesh2){

  location.href = 'page3.html'
  });

  
mmi.addHandler('geopin4','click', function(mesh4){
 
  location.href = 'page4.html'
  });

  
mmi.addHandler('geopin5','click', function(mesh5){

  location.href = 'page5.html'
  });


  
 

//mouse movement 
addEventListener('mousemove', () => {
	mouse.x = (event.clientX / innerWidth)*2 -1
	mouse.y = (event.clientY / innerHeight)*2 +1
   }) 
  
	
  console.log(mouse)
function animate(){
  requestAnimationFrame(animate)
  mmi.update()
  //mmi1.update()
  // render the scene
  renderer.render(scene, camera)
  sphere.rotation.y +=0.008
   group.rotation.y = mouse.x 
} 
animate()



























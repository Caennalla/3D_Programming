/*///
// Juho Roivas - 1201116
// 3D Graphics programming 
// Module 4
/////*/

var width = 800,
    height = 600
    viewAngle = 45,
    aspect = width/height,
    near = 1,
    far = 1000.0;

var renderer = null;
var scene = null;
var camera = null;

var mouse = {
    down: false,
    prevY: 0,
    prevX: 0
}

var camObject = null;
var keysPressed = [];

//angle variable for rotations
var angle = 0.0;

//The main arm component
var wholeArm = null;

//Variables that has to be accessed for rotations are specified here
var shoulder = null;
var elbow = null;
var hand = null;

$(function(){

    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();
    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);
    camObject = new THREE.Object3D();
    // create scene
    scene = new THREE.Scene();
    // camera will be the the child of camObject
    camObject.add(camera);
    // add camera to scene and set its position.
    scene.add(camObject);
    camObject.position.z = 5;
    camObject.position.y = 1.0;
    // define renderer viewport size
    renderer.setSize(width,height);
    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);
	
	//Create meshes and correct hierarchy
	
	wholeArm = new THREE.Object3D();
	//Shoulder, yellow
	shoulder = new THREE.Mesh(	new THREE.SphereGeometry(1, 10,10),
								new THREE.MeshBasicMaterial({color:0xffff00})
							);
							
	wholeArm.add(shoulder);						
							
	//Upper arm, pink
	var upperArm = new THREE.Mesh(	new THREE.BoxGeometry(1,4,1),
								new THREE.MeshBasicMaterial({color:0xb83bff})
							);
							
	shoulder.add(upperArm);
	
	//Elbow, orange
	
	elbow = new THREE.Mesh(	new THREE.SphereGeometry(1, 10,10),
								new THREE.MeshBasicMaterial({color:0xe78016})
							);
	//The reason it has to be part of shoulder is that it follows it's rotation
	shoulder.add(elbow);
	
	
	//lower arm, blue
	var lowerArm = new THREE.Mesh(	new THREE.BoxGeometry(1,4,1),
								new THREE.MeshBasicMaterial({color:0x200dec})
							);
							
	elbow.add(lowerArm);
	//hand, green
	hand = new THREE.Mesh(	new THREE.BoxGeometry(1.5,1.5,1.5),
								new THREE.MeshBasicMaterial({color:0x16f625})
							);
	//Same logic as with elbow joint, hand follows elbow rotation		
	elbow.add(hand);
	//Fingers, red
	var fingers = new Array();
	
	for(i = 0;i<4; i++ ){
		fingers[i] = createFinger();
		//Add each individual finger as hand's child
		hand.add(fingers[i]);
	}
	
	
	//Set the hand to the scene and correct placements
	
	scene.add(wholeArm);
	wholeArm.position.z = -15;
	wholeArm.position.y = -3.0;
	upperArm.position.y += 1.5;
	elbow.position.y += 4.3;
	lowerArm.position.y += 1.5;
	hand.position.y += 4.3; 
	
	// Place fingers, thumb also needs rotation
	
	//First do the three upper fingers
	fingers[0].position.y += 1.0;
	fingers[1].position.y += 1.0;
	fingers[2].position.y += 1.0;
	
	fingers[0].position.x -= 0.5;
	fingers[2].position.x += 0.5;
	
	//thumb, first rotation to get correct angle, then transform to correct place
	fingers[3].rotation.z = Math.PI / 2;
	fingers[3].position.x += 1.0; 	
	
    // request frame update and call update-function once it comes
    requestAnimationFrame(update);
	
    // Input handling, copied from the code examples
    // Setup simple input handling with mouse
    document.onmousedown = function(ev){
		mouse.down = true;
		mouse.prevY = ev.pageY;
		mouse.prevX = ev.pageX;
    }
    
    document.onmouseup = function(ev){
		mouse.down = false;
    }

    document.onmousemove = function(ev){
		if ( mouse.down ) {

			var rot = (ev.pageY - mouse.prevY) * 0.01;
			var rotY = (ev.pageX - mouse.prevX) * 0.01;
			camObject.rotation.y -= rotY;
			camera.rotation.x -= rot;
			mouse.prevY = ev.pageY;
			mouse.prevX = ev.pageX;
		}
    }
    ////////////////////
    // setup input handling with keypresses
    document.onkeydown = function(event) {
		keysPressed[event.keyCode] = true;
    }
    
    document.onkeyup = function(event) {
		keysPressed[event.keyCode] = false;
    }
    
    
    // querying supported extensions
    var gl = renderer.context;
    var supported = gl.getSupportedExtensions();

    /*/console.log("**** Supported extensions ***'");
    $.each(supported, function(i,d){
		console.log(d);
    });/*/
    

});



function update(){

    // Render settings
    renderer.setClearColor(0x000000, 1.0);
    renderer.clear(true);
    renderer.render(scene, camera); 
    
	
	//Rotation settings to make arm wave
	//console.log(Math.sin(angle));
	shoulder.rotation.z = Math.sin(angle);
	elbow.rotation.z = Math.cos(angle);
	hand.rotation.x = Math.sin(angle);
	angle += 0.02;
	
	
	//Keybuttons, copied from the code example
    if ( keysPressed["W".charCodeAt(0)] == true ){
		var dir = new THREE.Vector3(0,0,-1);
		var m = new THREE.Matrix4();
		camObject.matrixWorld.extractRotation(m);
		var dirW = dir.applyMatrix4(m);
		camObject.translateOnAxis(dirW, 0.1 );
    }
    
    if ( keysPressed["S".charCodeAt(0)] == true ){
		var dir = new THREE.Vector3(0,0,-1);

		var m = new THREE.Matrix4();
		camObject.matrixWorld.extractRotation(m);
		var dirW = dir.applyMatrix4(m);

		camObject.translateOnAxis(dirW, -0.1 );
    }
    if ( keysPressed["A".charCodeAt(0)] == true ){
		var dir = new THREE.Vector3(1,0,0);
		var dirW = dir.applyEuler( camObject.rotation);

		var m = new THREE.Matrix4();
		camObject.matrixWorld.extractRotation(m);
		var dirW = dir.applyMatrix4(m);

		camObject.translateOnAxis(dirW, -0.1 );
    }
    if ( keysPressed["D".charCodeAt(0)] == true ){
		var dir = new THREE.Vector3(1,0,0);
		var dirW = dir.applyEuler( camObject.rotation);

		var m = new THREE.Matrix4();
		camObject.matrixWorld.extractRotation(m);
		var dirW = dir.applyMatrix4(m);

		camObject.translateOnAxis(dirW, 0.1);
    }

    // request another frame update
    requestAnimationFrame(update);
}

function createFinger(){
	//Finger creation, red
	var finger = new THREE.Mesh(	new THREE.BoxGeometry(0.3,1.0,0.3),
								new THREE.MeshBasicMaterial({color:0xfb0000})
							);
	return finger;
}






    

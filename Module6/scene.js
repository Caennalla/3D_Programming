
// Parameters
var width = 800,
    height = 600
    viewAngle = 45,
    aspect = width/height,
    near = 0.1,
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
var ruins = [];

var shoulderRotationJoint;
var shoulderTiltingJoint;
var upperArm;
var elbowJoint;
var lowerArm;
var wrist;
var hand;
var thumb;
var indexfinger;
var middlefinger;
var pinky;

var fps = {
    width: 100,
    height: 50,
    svg: null,
    data: [],
    ticks: 0,
    time: null
}
var spotLight = null;
var spotLightObj = null;
var ambientLight = null;

//Variables for fire particles
var fireparticleCount = null;
var fireparticles = null;
var fireParticleMaterial = null;
var fireParticleSystem = null;

//Variables for smoke particles 
var smokeparticleCount = null;
var smokeparticles = null;
var smokeParticleMaterial = null;
var smokeParticleSystem = null;

//Cloud mesh
var cloudMesh = null;

//We can create a single function to pop up trees
var addTree = function(posX, posZ, texture){
	var geometry = new THREE.PlaneGeometry(4,4,4,4);
	var material = new THREE.MeshBasicMaterial({
		map: texture,
		side: THREE.DoubleSide,
		transparent: true,
		alphaTest: 0.5
		
	});
	
	var plane1 = new THREE.Mesh(geometry, material);
	plane1.position = new THREE.Vector3(posX, 2, posZ);
	plane1.rotation.x = Math.PI;
	scene.add(plane1);
	
	var plane2 = new THREE.Mesh(geometry,material);
	plane2.position = new THREE.Vector3(posX, 2, posZ);
	plane2.rotation.x = Math.PI;
	plane2.rotation.y = Math.PI/2;
	scene.add(plane2);
	
};

$(function(){

    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();

    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);

    // create scene
    scene = new THREE.Scene();
    camObject = new THREE.Object3D();
    camObject.add(camera);
    spotLightObj = new THREE.Object3D();
    spotLightObj.position.z = 0.1;
    camera.add(spotLightObj);

    // add camera to scene and set its position.
    scene.add(camObject);
    camObject.position.z = 5;
    camObject.position.y = 1.0;
    // define renderer viewport size
    renderer.setSize(width,height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

    // directional light for the moon
    var directionalLight = new THREE.DirectionalLight( 0x88aaff, 1.0 ); 
    directionalLight.position.set( 1, 1, -1 ); 
    scene.add( directionalLight );

    // Add ambient light, simulating surround scattering light
    ambientLight = new THREE.AmbientLight(0x282a2f);
    scene.add( ambientLight  );

    scene.fog = new THREE.Fog(0x172747, 1.0, 50.0);
	
	// load skybox materials 
    var skyboxMaterials = [];
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_west.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_east.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_up.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_down.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_north.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_south.png")}));
    $.each(skyboxMaterials, function(i,d){
		d.side = THREE.BackSide;
		d.depthWrite = false;
		d.transparent = false;
    });
    var sbmfm = new THREE.MeshFaceMaterial(skyboxMaterials);
    sbmfm.depthWrite = false;
    // Create a new mesh with cube geometry 
    var skybox = new THREE.Mesh(
		new THREE.CubeGeometry( 1,1,1,1,1,1 ), 
		sbmfm
    );

    skybox.position = camObject.position;
	//Renderdepth set to 0, as this is the furthest object in the scene
	skybox.renderDepth = 0;
    scene.add(skybox);
    
    
    var loader = new THREE.JSONLoader();
	
	//Handler for adding ruins
    function handler(geometry, materials) {
		var m = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
			map: THREE.ImageUtils.loadTexture("rock.jpg"),
			transparent: false
	    }))
		//Render depth
		m.renderDepth = 100;
		ruins.push(m);
		checkIsAllLoaded();
    }
    
	
	
	
    function checkIsAllLoaded(){
	if ( ruins.length == 5 ) {
	    $.each(ruins, function(i,mesh){
		scene.add(mesh);
		// mesh is rotated around x-axis
		mesh.rotation.x = Math.PI/2.0;
	    });
	    // arcs
	    ruins[0].position.z = 13;
	    // corner
	    ruins[1].position.x = 13;

	    // crumbled place
	    ruins[2].position.x = -13;
	    

	    ruins[3].position.z = -13;
	}
    }
    loader.load("meshes/ruins30.js", handler);    
    loader.load("meshes/ruins31.js", handler);
    loader.load("meshes/ruins33.js", handler);
    loader.load("meshes/ruins34.js", handler); 
    loader.load("meshes/ruins35.js", handler); 
	
    
    
    // Create ground from cube and some rock
    var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");

    // texture wrapping mode set as repeating
    rockTexture.wrapS = THREE.RepeatWrapping;
    rockTexture.wrapT = THREE.RepeatWrapping;



    // Construct a mesh object
    var ground = new THREE.Mesh( new THREE.CubeGeometry(100,0.2,100,1,1,1),
				 new THREE.MeshPhongMaterial({
				     map: rockTexture,
				     transparent: false,
					 depthWrite: false
				 }));

    
    // Do a little magic with vertex coordinates so ground looks more interesting
    $.each(ground.geometry.faceVertexUvs[0], function(i,d){

	d[0] = new THREE.Vector2(0,25);
	d[2] = new THREE.Vector2(25,0);
	d[3] = new THREE.Vector2(25,25);
    });
	
	ground.renderDepth = 2001;
    scene.add(ground);
	
	//Particle system for fire
	fireparticleCount = 40;
	fireparticles = new THREE.Geometry();
	fireParticleMaterial = new THREE.ParticleBasicMaterial({
		size: 1,
		map: THREE.ImageUtils.loadTexture("fire.png"),
		transparent: true,
		depthWrite: false,
		blending: THREE.CustomBlending,
		blendEquation: THREE.AddEquation,
		blendSrc: THREE.SrcAlphaFactor,
		blendDst: THREE.OneFactor,
		depthWrite: false
	});
	for (var p = 0; p < fireparticleCount; p++){
		
		var pX = Math.random() * 0.5,
			pY = Math.random() * 0.4,
			pZ = 3,
			particle = new THREE.Vector3(pX,pY,pZ);
		particle.velocity = new THREE.Vector3(Math.random * 0.3, Math.random * 0.3, 0);
		particle.respawnTimer = Math.random();
		fireparticles.vertices.push(particle);
		
	}
	
	console.log(fireparticles.vertices[4]);
	
	fireParticleSystem = new THREE.ParticleSystem(fireparticles, fireParticleMaterial);
	fireParticleSystem.renderDepth = 0;
	fireParticleSystem.sortParticles = true;
	scene.add(fireParticleSystem);
	
	//Particle system for smoke
	smokeparticleCount = 40;
	smokeparticles = new THREE.Geometry();
	smokeParticleMaterial = new THREE.ParticleBasicMaterial({
		size: 1,
		map: THREE.ImageUtils.loadTexture("smoke.png"),
		transparent: true,
		depthWrite: false,
		blending: THREE.CustomBlending,
		blendEquation: THREE.AddEquation,
		blendSrc: THREE.SrcAlphaFactor,
		blendDst: THREE.OneFactor
	});
	for (var p = 0; p < smokeparticleCount; p++){
		
		var pX = Math.random() * 0.5,
			pY = Math.random() * 0.6 + 0.4,
			pZ = 3,
			particle = new THREE.Vector3(pX,pY,pZ);
		particle.velocity = new THREE.Vector3(Math.random * 0.3, Math.random * 0.3, 0);
		particle.respawnTimer = Math.random();
		smokeparticles.vertices.push(particle);
		
	}
	
	
	smokeParticleSystem = new THREE.ParticleSystem(smokeparticles, smokeParticleMaterial);
	smokeParticleSystem.renderDepth = 0;
	smokeParticleSystem.sortParticles = true;
	scene.add(smokeParticleSystem);
	
	//Loading cloud texture from js file
	loader.load("meshes/sky.js", function (geometry, materials){
			cloudMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture("clouds.png"),
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending
			
		}));
		
		cloudMesh.position = camObject.position;
		scene.add(cloudMesh);
	});
	console.log(cloudMesh);
	
    //Loading trees
	var pineTree = THREE.ImageUtils.loadTexture("pine.png");
	var limeTree = THREE.ImageUtils.loadTexture("lime.png");
	addTree(5, 10, pineTree);
	addTree(10, 10, pineTree);
	addTree(15, 10, pineTree);
	addTree(20, 10, pineTree);
	addTree(25, 10, pineTree);
	
	addTree(5, 15, limeTree);
	addTree(10, 15, limeTree);
	addTree(15, 15, limeTree);
	addTree(20, 15, limeTree);
	addTree(25, 15, limeTree);

	
    
    fps.time = new Date();
    // request frame update and call update-function once it comes
    requestAnimationFrame(update);

    ////////////////////
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

    //Create SVG element (ain't HTML5 grand stuff?)
    fps.svg = d3.select("#fps")
	.append("svg")
	.attr("width", fps.width)
	.attr("height", fps.height);

});

var angle = 0.0;
var movement = 0.0;
var moving = false;
function update(){

    // render everything 
    renderer.setClearColorHex(0x000000, 1.0);
    renderer.clear(true);
    renderer.render(scene, camera); 
    angle += 0.001;
    moving = false;
    if ( keysPressed["W".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
	moving = true;
    }

    if ( keysPressed["S".charCodeAt(0)] == true ){

	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
	moving = true;

    }
    if ( keysPressed["A".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(-1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
	moving = true;
    }

    if ( keysPressed["D".charCodeAt(0)] == true ){

	var dir = new THREE.Vector3(-1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
	moving = true;
    }
 
    // so strafing and moving back-fourth does not double the bounce
    if ( moving ) {
	movement+=0.1;
	camObject.position.y = Math.sin(movement*2.30)*0.07+1.2; 
    }
 

    var dir = new THREE.Vector3(0,0,-1);
    var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);


 
	
	//Updates for the particles
	for(pCount = 0; pCount < fireparticleCount; pCount++){	
		fireparticles.vertices[pCount].add(fireparticles.vertices[pCount].velocity);
		fireparticles.vertices[pCount].respawnTimer += 0.2;
		
		//If particle reaches respawn time, respawn it
		if(fireparticles.vertices[pCount].respawnTimer > 1){
			fireparticles.vertices[pCount].set(Math.random()* 0.5, Math.random() * 0.4, 3);
			fireparticles.vertices[pCount].respawnTimer = Math.random();
		}
	}

	for(pCount = 0; pCount < smokeparticleCount; pCount++){	
		smokeparticles.vertices[pCount].add(smokeparticles.vertices[pCount].velocity);
		smokeparticles.vertices[pCount].respawnTimer += 0.2;
		
		//If particle reaches respawn time, respawn it
		if(smokeparticles.vertices[pCount].respawnTimer > 1){
			smokeparticles.vertices[pCount].set(Math.random()* 0.5, Math.random() * 0.6 + 0.4, 3);
			smokeparticles.vertices[pCount].respawnTimer = Math.random();
		}
	}
	
	//Cloudmesh rotation, we have to check that cloudMesh has already been loaded, otherwise crash occurs
	if(cloudMesh) cloudMesh.rotation.y += 0.005; 
	
	
    // request another frame update
    requestAnimationFrame(update);
    
	
	//////////
    fps.ticks++;
    var tmp = new Date();
    var diff = tmp.getTime()-fps.time.getTime();

    if ( diff > 1000.0){
	fps.data.push(fps.ticks);
	if ( fps.data.length > 15 ) {
	    fps.data.splice(0, 1);
	}
	fps.time = tmp;
	fps.ticks = 0;
	displayFPS();
    }
    ///////////
	
	

}
  
// for displaying fps meter 
function displayFPS(){

    fps.svg.selectAll("rect").remove();
    
    fps.svg.append("rect")
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", 100)
	.attr("height", 50)
	.attr("fill", "rgb(0,0,0)");

    fps.svg.selectAll("rect")
	.data(fps.data)
	.enter()
	.append("rect")
	.attr("x", function(d, i) {
	    return (i * (2+1));  //Bar width of 20 plus 1 for padding
	})
	.attr("y", function(d,i){
	    return 50-(d/2);
	})
	.attr("width", 2)
	.attr("height", function(d,i){
	    return (d/2);
	})
	.attr("fill", "#FFFFFF");
	
    fps.svg.selectAll("text").remove();
    fps.svg
	.append("text")
	.text( function(){
	    return fps.data[fps.data.length-1] + " FPS";
	})
	.attr("x", 50)
	.attr("y", 25)
	.attr("fill", "#FFFFFF");
}  





















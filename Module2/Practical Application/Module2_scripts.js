/*/
//Juho Roivas - 1201116
//3d-programming module 2
//Javascript file
/*/

var gl = null,
	canvas = null,
	glProgram = null,
	fragmentShader = null,
	vertexShader = null;
	
var vertexIndexAttribute = null,
	triangleVertexIndices = null;
	
var	radius = 0.7;

function initWebGL(drawStyle){

	canvas = document.getElementById("my-canvas");

	try{
		 gl = canvas.getContext("webgl") ||
		 canvas.getContext("experimental-webgl");
	}catch(e){}

	if(gl){
		initShaders();
		setupBuffers();
		setupWebGL();
		drawScene(drawStyle);


	}else{
			  alert( "Error: Your browser does not appear to" + "support WebGL.");
	}

}

function setupWebGL(){

	//set the clear color to a shade of green
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//Setting up the viewport
	gl.viewport(0,0,canvas.width, canvas.height);
	
	//Setting the radius uniform
	//First we look up the rotation uniform inside the vertex shader
	var radiusLocation = gl.getUniformLocation(glProgram, "uRadius");
	//Then we'll save our wanted radius using the specific command for float
	gl.uniform1f(radiusLocation, radius);
	
	//This tells the max amount of varying vectors
	//console.log(gl.getParameter(gl.MAX_VARYING_VECTORS));

	
	
}

function initShaders(){

	//get shader source

var fs_source = document.getElementById('shader-fs').innerHTML,
	vs_source = document.getElementById('shader-vs').innerHTML;

	//compile shaders
	vertexShader = makeShader(vs_source, gl.VERTEX_SHADER);
	fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);

	//create program
	glProgram = gl.createProgram();

	//attach and link shaders to the program

	gl.attachShader(glProgram, vertexShader);
	gl.attachShader(glProgram, fragmentShader);
	gl.linkProgram(glProgram);

	if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)){
		 alert("Unable to initialize the shader program.");
	}

	//use program
	gl.useProgram(glProgram);

}

function makeShader(src, type){

	//compile the vertex shader
	var shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		 alert("Error compiling shader: " + gl.getShaderInfoLog(shader));
	}

	return shader;

}

function setupBuffers(){						
	
	//Data to vertice buffers, could have been a nice loop too
	var verticesIndices = [
		0.0,1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,11.0,12.0,13.0,14.0,15.0
		//15.0,14.0,13.0,12.0,11.0,10.0,9.0,8.0,7.0,6.0,5.0,4.0,3.0,2.0,1.0,0.0

	];

	triangleVertexIndices = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexIndices);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesIndices), gl.STATIC_DRAW);
	
	//Index data
	vertexIndexAttribute = gl.getAttribLocation(glProgram, "aIndexNumber");
	gl.enableVertexAttribArray(vertexIndexAttribute);
	gl.vertexAttribPointer(vertexIndexAttribute, 1, gl.FLOAT, false, 0, 0);
	
}


function drawScene(drawStyle){
	//Draw commands
	if(drawStyle == 0){
		gl.drawArrays(gl.TRIANGLE_FAN,0,16);
	}
	else if(drawStyle == 1){
		gl.drawArrays(gl.LINE_LOOP,0,16);
	}
	else if(drawStyle == 2){
		
		gl.drawArrays(gl.POINTS,0,16);
	}

}



var   gl = null,
	canvas = null,
	glProgram = null,
	fragmentShader = null,
	vertexShader = null;
	
var  vertexPositionAttribute = null,
	vertexColorAttribute = null,
	
	trianglesVerticeBuffer = null,
	trianglesColorBuffer = null,
	triangleVerticesIndexBuffer = null;
	
var	angle = 0.0;

var 	mvMatrix = mat4.create(),
		pMatrix=mat4.create();

function initWebGL(){

	canvas = document.getElementById("my-canvas");

	try{
		 gl = canvas.getContext("webgl") ||
		 canvas.getContext("experimental-webgl");
	}catch(e){}

	if(gl){
		initShaders();
		setupBuffers();
		getMatrixUniforms();
		
		(function animLoop(){
			setupWebGL();
			setMatrixUniforms();
			drawScene();
			requestAnimationFrame(animLoop, canvas);
		})();
	}else{
			  alert( "Error: Your browser does not appear to" + "support WebGL.");
	}

}

function setupWebGL(){

	//set the clear color to a shade of green
	gl.clearColor(0.1, 0.5, 0.1, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	//Setting up the viewport
	gl.viewport(0,0,canvas.width, canvas.height);
	
	//Setting up matrix
	mat4.perspective(pMatrix, 45, canvas.width / canvas.height, 0.1, 100.0);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, mvMatrix, [0, 0, -7.0]);
	mat4.rotate(mvMatrix, mvMatrix, angle, [0.0, 1.0, 0.0]);
	angle += 0.1;
	
}

function initShaders(){

	//get shader source

var      fs_source = document.getElementById('shader-fs').innerHTML,
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
	//Data for color buffer
	var triangleVerticeColors = [
	 //front face

		0.0, 0.0, 1.0,
		1.0, 1.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		1.0, 1.0, 1.0,

		//rear face

		0.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		0.0, 1.0, 1.0,
		0.0, 1.0, 1.0,
		0.0, 1.0, 1.0,
		1.0, 1.0, 1.0
	];

	trianglesColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, trianglesColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticeColors), gl.STATIC_DRAW);
	
	//Data for vector positions
	
	var triangleVertices = [

		//front face
		//bottom left to right, to top
		0.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		2.0, 0.0, 0.0,
		0.5, 1.0, 0.0,
		1.5, 1.0, 0.0,
		1.0, 2.0, 0.0,

		//rear face
		0.0, 0.0, -2.0,
		1.0, 0.0, -2.0,
		2.0, 0.0, -2.0,
		0.5, 1.0, -2.0,
		1.5, 1.0, -2.0,
		1.0, 2.0, -2.0
    ];

	trianglesVerticeBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
	
	//Data to vertice buffers
	var triangleVertexIndices = [

		//front face
		0,1,3,
		1,3,4,
		1,2,4,
		3,4,5,

		//rear face
		6,7,9,
		7,9,10,
		7,8,10,
		9,10,11,

		//left side
		0,3,6,
		3,6,9,
		3,5,9,
		5,9,11,

		//right side
		2,4,8,
		4,8,10,
		4,5,10,
		5,10,11,

		//bottom faces
		0,6,8,
		8,2,0

	];

	triangleVerticesIndexBuffer = gl.createBuffer();
	triangleVerticesIndexBuffer.number_vertex_points = triangleVertexIndices.length; 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleVerticesIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleVertexIndices), gl.STATIC_DRAW);
	
}



function drawScene(){
	//Position data
	vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	
	//Color data
	vertexColorAttribute = gl.getAttribLocation(glProgram, "aVertexColor");
	gl.enableVertexAttribArray(vertexColorAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, trianglesColorBuffer);
	gl.vertexAttribPointer(vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);
	
	//Index data
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleVerticesIndexBuffer);
	//Draw command
	gl.drawElements(gl.TRIANGLES,triangleVerticesIndexBuffer.number_vertex_points, gl.UNSIGNED_SHORT, 0);

}

function getMatrixUniforms(){

glProgram.pMatrixUniform = gl.getUniformLocation(glProgram, "uPMatrix"); 
glProgram.mvMatrixUniform = gl.getUniformLocation(glProgram, "uMVMatrix");

}

function setMatrixUniforms(){
gl.uniformMatrix4fv(glProgram.pMatrixUniform, false, pMatrix);
gl.uniformMatrix4fv(glProgram.mvMatrixUniform, false, mvMatrix);
}
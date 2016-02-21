/*/
/// Juho Roivas - 1201116
///	3D Programming Basics
/// Module 3
/*/

var gl = null,
	canvas = null,
	glProgram = null,
	fragmentShader = null,
	vertexShader = null;
	
var vertexPositionAttribute = null,
	
	trianglesVerticeBuffer = null,
	triangleVerticesIndexBuffer = null;
	
var	angle = 0.0;
	
	//New variables for textures
var texture = null,
	textureImage = [],
	imageArray = ["posz.jpg", "negz.jpg", "negx.jpg", "posx.jpg", "negy.jpg", "posy.jpg"];
	//Matrix variables for camera
var mvMatrix = mat4.create(),
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
		//New function to call texture loading and setuping
		loadTexture();
		
		//Animation loop to spin around to see all textures
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

	//clear canvas
	gl.clearColor(0.1, 0.5, 0.1, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	//Setting up the viewport
	gl.viewport(0,0,canvas.width, canvas.height);
	
	//Setting up matrix
	mat4.perspective(pMatrix, 45, canvas.width / canvas.height, 0.1, 100.0);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, mvMatrix, [0, 0, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, angle, [0.0, 1.0, 0.0]);
	angle += 0.02;
	
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

	//Vertex data for cube, 8 vectors in total
		var triangleVerticesOriginal = [
			// front square
			-1,1,-1,
			1,1,-1,
			-1,-1,-1,
			1,-1,-1,
			//back square
			-1,1,1,
			1,1,1,
			-1,-1,1,
			1,-1,1          

		];

		//Index data, indices match the image order
		var triangleVertexIndices = [
			
			//Facing front
			6,4,7,
			7,4,5,
			//Facing back
			2,3,0,
			3,0,1,
			//Left side
			0,4,2,
			2,4,6,
			//Right side
			5,7,3,
			1,5,3,
			//Down facing up
			6,7,2,
			2,7,3,
			//Up facing down
			0,4,1,
			1,4,5

		];

		//Buffer the position data
        trianglesVerticeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticesOriginal), gl.STATIC_DRAW);
		
		//Buffer the indices data
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

//Load texture function
function loadTexture(){
	for(i = 0; i < imageArray.length; i++){
		textureImage[i] = new Image();	
		//When we load the last one in to our textureImage array, run setupTexture
		if (i == 5){
			textureImage[i].onload = function(){setupTexture();}
		}
		//Set the source for images 
		textureImage[i].src = imageArray[i];
	}
}
function setupTexture(){
	texture = gl.createTexture();
	//Activate the default texture
	gl.activeTexture(gl.TEXTURE0);
	//Bind cube map to our texture
	gl.bindTexture(gl.TEXTURE_CUBE_MAP,texture);
	//Add data to our cube map, this uses currently bound texture
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z,0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage[0]);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage[1]);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X,0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage[2]);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X,0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage[3]);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage[4]);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y,0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage[5]);
	//Filters, MIN_FILTER to use shrinking to fit image, nearest gives a decent result
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	//We'll clamp_to_Edge both S and T, so we won't produce repeats
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	//If we didn't get a texture
	if(!gl.isTexture(texture)){
		console.log("Texture is not valid");
	}
	
	//Get the location of our cube sampler
	glProgram.samplerUniform = gl.getUniformLocation(glProgram,"uSampler");
	//Load the sampler with the texture data
	gl.uniform1i(glProgram.samplerUniform,0);

	

}


















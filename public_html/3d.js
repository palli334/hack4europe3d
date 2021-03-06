	// reference by [y][x]
	var cubeMap = [
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
					[0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],
					[0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],
					[0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],
					[0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],
					[0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],
					[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
					[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
					[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
					[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
					[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
					[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
					[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ] ;
	
	
	var mapWidth = cubeMap[0].length;
	var mapHeight = cubeMap.length;
	
	var ceilingHeight = 10;
	var wallWidth = 10;

    var gl;
	
	var standingHeight = 6;// how tall we are. really affects how big the world feels

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }


    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }


    var shaderProgram;

    function initShaders() {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    }


    function handleLoadedTexture(texture) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

	
	var buildingTextures = [];	
    var floorTextureSubscript = 0;
	var wallTextureSubscript = 1;
	var ceilingTextureSubscript = 2;
	
	var highlighterTextures = [];
	var highlighterFloorTextureSubscript = 0;
	var highlighterWallTextureSubscript = 1;
	
	var artworksTextures = [];
	
    function initTexture() {
	 	buildingTextures[floorTextureSubscript] = gl.createTexture();
        buildingTextures[floorTextureSubscript].image = new Image();
        buildingTextures[floorTextureSubscript].image.onload = function () {
            handleLoadedTexture(buildingTextures[floorTextureSubscript])
        }
        buildingTextures[floorTextureSubscript].image.src = "images/buildingLayout/floor.png";
		
		buildingTextures[wallTextureSubscript] = gl.createTexture();
        buildingTextures[wallTextureSubscript].image = new Image();
        buildingTextures[wallTextureSubscript].image.onload = function () {
            handleLoadedTexture(buildingTextures[wallTextureSubscript])
        }
        buildingTextures[wallTextureSubscript].image.src = "images/buildingLayout/wall.png";
        		
		buildingTextures[ceilingTextureSubscript] = gl.createTexture();
        buildingTextures[ceilingTextureSubscript].image = new Image();
        buildingTextures[ceilingTextureSubscript].image.onload = function () {
            handleLoadedTexture(buildingTextures[ceilingTextureSubscript])
        }
        buildingTextures[ceilingTextureSubscript].image.src = "images/buildingLayout/ceiling.png";
		
		highlighterTextures[highlighterFloorTextureSubscript] = gl.createTexture();
        highlighterTextures[highlighterFloorTextureSubscript].image = new Image();
        highlighterTextures[highlighterFloorTextureSubscript].image.onload = function () {
            handleLoadedTexture(highlighterTextures[highlighterFloorTextureSubscript])
        }
        highlighterTextures[highlighterFloorTextureSubscript].image.src = "images/buildingLayout/floorHi.png";
		
		highlighterTextures[highlighterWallTextureSubscript] = gl.createTexture();
        highlighterTextures[highlighterWallTextureSubscript].image = new Image();
        highlighterTextures[highlighterWallTextureSubscript].image.onload = function () {
            handleLoadedTexture(highlighterTextures[highlighterWallTextureSubscript])
        }
        highlighterTextures[highlighterWallTextureSubscript].image.src = "images/buildingLayout/wallHi.png";
    }
	

    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }


    function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    }


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }



    var currentlyPressedKeys = {};

    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
    }


    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }


    var pitch = 0;
    var pitchRate = 0;

    var yaw = 180;
    var yawRate = 0;

    var xPos = 76;
    var yPos = standingHeight;
    var zPos = 91;

    var speed = 0;
	var maxSpeed = 0.008;
	
	var	strafe = 0;
	var maxStrafe = 0.006;

	var wallFace = 0;
    function handleKeys() {
		if( currentlyPressedKeys[16]) {
			// q
			// add artwork
				placeArtwork( 10, 10, 0, 5, 5,"images/buildingLayout/floor.png", 256, 256 );
			currentlyPressedKeys[16] = false;
		}
	
        if (currentlyPressedKeys[33]) {
            // Page Up
            pitchRate = 0.1;
        } else if (currentlyPressedKeys[34]) {
            // Page Down
            pitchRate = -0.1;
        } else {
            pitchRate = 0;
        }

        if (currentlyPressedKeys[37] ) {
            // Left cursor key
            yawRate = 0.1;
        } else if (currentlyPressedKeys[39] ) {
            // Right cursor key
            yawRate = -0.1;
        } else {
            yawRate = 0;
        }
		
		if (currentlyPressedKeys[65]) {
            // A
            strafe = maxStrafe;
        } else if (currentlyPressedKeys[68]) {
            // D
			strafe = -maxStrafe;
        } else {
            strafe = 0;
        }

        if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
            // Up cursor key or W
            speed = maxSpeed;
        } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
            // Down cursor key
            speed = -maxSpeed;
        } else {
            speed = 0;
        }

    }

	var buildingLayoutVertexPositionBuffer = [];
	var buildingLayoutVertexTextureCoordBuffer = [];
	var buildingLayoutTextureNumber = [];
	
	var highlighterVertexPositionBuffer;
	var highlighterTextureCoordBuffer;
	var highlighterTextureNumber;
	var highlighterIsOn = false;
	
	var artworksVertexPositionBuffer = [];
	var artworksTextureCoordBuffer = [];
	var artworksTextureNumber = [];
	
	var artworks = []; // expects: centerX, centerY, image, subscript, aspect, scale
	var numArtworks = 0;
	
	
	var vertexFactorMap = [ [ 0.0, 0.0, 0.0, 1.0 ],
							[ 0.0, 1.0, 0.0, 0.0 ],
							[ 1.0, 1.0, 1.0, 0.0 ],
							[ 0.0, 0.0, 0.0, 1.0 ],
							[ 1.0, 0.0, 1.0, 1.0 ],
							[ 1.0, 1.0, 1.0, 0.0 ] ];
	
	
	var floorAndCeilingTextureTileFactor = 1.0;
		
	function buildFloorAndCeiling() {
		var floorVertexPositions = [];
		var floorVertexTextureCoords = [];
		var floorVertexCount = 0;
		var ceilingVertexPositions = [];
		var ceilingVertexTextureCoords = [];
		var ceilingVertexCount = 0;
		for( var j = 0 ; j < mapHeight ; j++ ) {
			for( var i = 0 ; i < mapWidth ; i++ ) {
				if( cubeMap[j][i] == 1 ) {
					// FLOOR
					for( var k = 0 ; k < 6 ; k++ ){
						pushVertexToArrays( floorVertexPositions, floorVertexTextureCoords,
											(i * wallWidth) + (wallWidth * vertexFactorMap[k][0] ),
											0.0,
											(j * wallWidth) + (wallWidth * vertexFactorMap[k][1] ),
											floorAndCeilingTextureTileFactor * vertexFactorMap[k][2],
											floorAndCeilingTextureTileFactor * vertexFactorMap[k][3] );
					}
					floorVertexCount += 6;
					
					// CEILILNG
					for( var k = 0 ; k < 6 ; k++ ){
						pushVertexToArrays( ceilingVertexPositions, ceilingVertexTextureCoords,
											(i * wallWidth) + (wallWidth * vertexFactorMap[k][0] ),
											ceilingHeight,
											(j * wallWidth) + (wallWidth * vertexFactorMap[k][1] ),
											floorAndCeilingTextureTileFactor * vertexFactorMap[k][2],
											floorAndCeilingTextureTileFactor * vertexFactorMap[k][3] );
					}
					ceilingVertexCount += 6;
				}
			}
		}
		
		// push floors to GL arrays
//		buildingLayoutVertexPositionBuffer[buildingLayoutVertexCount] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexPositionBuffer[0]);
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertexPositions), gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(floorVertexPositions));
        buildingLayoutVertexPositionBuffer[0].itemSize = 3;
        buildingLayoutVertexPositionBuffer[0].numItems = floorVertexCount;

//        buildingLayoutVertexTextureCoordBuffer[buildingLayoutVertexCount] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexTextureCoordBuffer[0]);
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertexTextureCoords), gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(floorVertexTextureCoords));
        buildingLayoutVertexTextureCoordBuffer[0].itemSize = 2;
        buildingLayoutVertexTextureCoordBuffer[0].numItems = floorVertexCount;
		
		buildingLayoutTextureNumber[0] = floorTextureSubscript;
		
		// push ceilings to GL arrays
//		buildingLayoutVertexPositionBuffer[buildingLayoutVertexCount] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexPositionBuffer[1]);
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ceilingVertexPositions), gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(ceilingVertexPositions));
        buildingLayoutVertexPositionBuffer[1].itemSize = 3;
        buildingLayoutVertexPositionBuffer[1].numItems = ceilingVertexCount;

//        buildingLayoutVertexTextureCoordBuffer[buildingLayoutVertexCount] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexTextureCoordBuffer[1]);
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ceilingVertexTextureCoords), gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(ceilingVertexTextureCoords));
        buildingLayoutVertexTextureCoordBuffer[1].itemSize = 2;
        buildingLayoutVertexTextureCoordBuffer[1].numItems = ceilingVertexCount;
		
		buildingLayoutTextureNumber[1] = ceilingTextureSubscript;
	}
	
    function initFloorAndCeiling() {
		buildingLayoutVertexPositionBuffer[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexPositionBuffer[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dummyBuffer), gl.DYNAMIC_DRAW);

        buildingLayoutVertexTextureCoordBuffer[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexTextureCoordBuffer[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dummyBuffer), gl.DYNAMIC_DRAW);
	
		buildingLayoutVertexPositionBuffer[1] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexPositionBuffer[1]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dummyBuffer), gl.DYNAMIC_DRAW);

        buildingLayoutVertexTextureCoordBuffer[1] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexTextureCoordBuffer[1]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dummyBuffer), gl.DYNAMIC_DRAW);
    }

	var wallTextureTileFactor = 1.0;
	
	function buildWalls() {
		var horizontalVertexPositions = [];
		var horizontalVertexTextureCoords = [];
		var horizontalVertexCount = 0;
		for( var i = 0 ; i < mapWidth ; i++ ) {
			var lastMapValue = cubeMap[0][i];
			for( var j = 1 ; j < mapHeight ; j++ ) {
				if( cubeMap[j][i] != lastMapValue ) {
					for( var k = 0 ; k < 6 ; k++ ){
						pushVertexToArrays( horizontalVertexPositions, horizontalVertexTextureCoords,
											(i * wallWidth) + (wallWidth * vertexFactorMap[k][0] ),
											(wallWidth * vertexFactorMap[k][1] ),
											(j * wallWidth),
											wallTextureTileFactor * vertexFactorMap[k][2],
											wallTextureTileFactor * vertexFactorMap[k][3] );
					}
					horizontalVertexCount += 6;
				}
				lastMapValue = cubeMap[j][i];
			}
		}
		// push horizontal walls to GL arrays
//		buildingLayoutVertexPositionBuffer[buildingLayoutVertexCount] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexPositionBuffer[2]);
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(horizontalVertexPositions), gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(horizontalVertexPositions));
        buildingLayoutVertexPositionBuffer[2].itemSize = 3;
        buildingLayoutVertexPositionBuffer[2].numItems = horizontalVertexCount;

 //       buildingLayoutVertexTextureCoordBuffer[buildingLayoutVertexCount] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexTextureCoordBuffer[2]);
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(horizontalVertexTextureCoords), gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(horizontalVertexTextureCoords));
        buildingLayoutVertexTextureCoordBuffer[2].itemSize = 2;
        buildingLayoutVertexTextureCoordBuffer[2].numItems = horizontalVertexCount;
		
		buildingLayoutTextureNumber[2] = wallTextureSubscript;
		
		// vertical walls
		var verticalVertexPositions = [];
		var verticalVertexTextureCoords = [];
		var verticalVertexCount = 0;
		for( var j = 0 ; j < mapHeight ; j++ ) {
			var lastMapValue = cubeMap[j][0];
			for( var i = 1 ; i < mapWidth ; i++ ) {
				if( cubeMap[j][i] != lastMapValue ) {
					for( var k = 0 ; k < 6 ; k++ ){
						pushVertexToArrays( verticalVertexPositions, verticalVertexTextureCoords,
											(i * wallWidth),
											(wallWidth * vertexFactorMap[k][1] ),
											(j * wallWidth) + (wallWidth * vertexFactorMap[k][0] ),
											wallTextureTileFactor * vertexFactorMap[k][2],
											wallTextureTileFactor * vertexFactorMap[k][3] );
					}
					verticalVertexCount += 6;
				}
				lastMapValue = cubeMap[j][i];
			}
		}
		// push vertical walls to GL arrays
//		buildingLayoutVertexPositionBuffer[buildingLayoutVertexCount] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexPositionBuffer[3]);
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticalVertexPositions), gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(verticalVertexPositions));
        buildingLayoutVertexPositionBuffer[3].itemSize = 3;
        buildingLayoutVertexPositionBuffer[3].numItems = verticalVertexCount;

//        buildingLayoutVertexTextureCoordBuffer[buildingLayoutVertexCount] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexTextureCoordBuffer[3]);
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticalVertexTextureCoords), gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(verticalVertexTextureCoords));
        buildingLayoutVertexTextureCoordBuffer[3].itemSize = 2;
        buildingLayoutVertexTextureCoordBuffer[3].numItems = verticalVertexCount;
		
		buildingLayoutTextureNumber[3] = wallTextureSubscript;
	}
	
    var dummyBuffer = [];
    for (var i = 0; i < 1000; i++) { dummyBuffer.push(0); }

    function initWalls() {
		buildingLayoutVertexPositionBuffer[2] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexPositionBuffer[2]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dummyBuffer), gl.DYNAMIC_DRAW);

        buildingLayoutVertexTextureCoordBuffer[2] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexTextureCoordBuffer[2]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dummyBuffer), gl.DYNAMIC_DRAW);

		buildingLayoutVertexPositionBuffer[3] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexPositionBuffer[3]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dummyBuffer), gl.DYNAMIC_DRAW);

        buildingLayoutVertexTextureCoordBuffer[3] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexTextureCoordBuffer[3]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dummyBuffer), gl.DYNAMIC_DRAW);
    }

	function createHighlighter() {
		var vertexPositions = [];
		var vertexTextureCoords = [];
		// fill with empty values for now, will be filled with values when turned on by picker
		for( var i = 0 ; i < 6 ; i++ ) {
			pushVertexToArrays( vertexPositions, vertexTextureCoords, 0, 0, 0,
								vertexFactorMap[i][2], vertexFactorMap[i][3] );
		}
		var vertexCount = 6;
		
		// push vertical walls to GL arrays
		highlighterVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, highlighterVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.DYNAMIC_DRAW);
        highlighterVertexPositionBuffer.itemSize = 3;
        highlighterVertexPositionBuffer.numItems = vertexCount;

        highlighterTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, highlighterTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
        highlighterTextureCoordBuffer.itemSize = 2;
        highlighterTextureCoordBuffer.numItems = vertexCount;
		
		highlighterTextureNumber = wallTextureSubscript;
	}
	
	
	// expects: centerX, centerY, image, subscript, aspect, scale
	var artworksVertexPositionBuffer = [];
	var artworksTextureCoordBuffer = [];
	var artworksTextureNumber = [];
	var artworkDefaultScale = 1.0;
	var artworkDistanceFromWall = 0.2;
	function placeArtwork( gridX, gridY, face, localX, localY, artworkURL, artworkWidth, artworkHeight ) {
        artworks[numArtworks] = { centerX: localX, centerY: localY, imageURL: artworkURL,
									subscript: numArtworks, width: artworkWidth, height: artworkHeight,
									scale: artworkDefaultScale };
		// create texture
		artworksTextures[numArtworks] = gl.createTexture();
        artworksTextures[numArtworks].image = new Image();
		var tmp = numArtworks;
        artworksTextures[numArtworks].image.onload = function () {
            handleLoadedTexture(artworksTextures[tmp])
        }
        artworksTextures[numArtworks].image.src = artworks[numArtworks].imageURL;
		
		// set position and texture points
		var vertexPositions = [];
		var vertexTextureCoords = [];
		// texture points
		for( var k = 0 ; k < 6 ; k++ ){
			vertexTextureCoords[(k*2)] = vertexFactorMap[k][2];
			vertexTextureCoords[(k*2)+1] = vertexFactorMap[k][3];
		}
		var x = gridX;
		var y = gridY;
		
		if( face == 2 ) { //west
				vertexPositions = [ (x * wallWidth) - artworkDistanceFromWall, (wallWidth * vertexFactorMap[0][1] ) ,
									(y * wallWidth) + (wallWidth * vertexFactorMap[0][0] ),
								(x * wallWidth)- artworkDistanceFromWall, (wallWidth * vertexFactorMap[1][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[1][0] ),
								(x * wallWidth)- artworkDistanceFromWall, (wallWidth * vertexFactorMap[2][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[2][0] ),
								(x * wallWidth)- artworkDistanceFromWall, (wallWidth * vertexFactorMap[3][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[3][0] ),
								(x * wallWidth)- artworkDistanceFromWall, (wallWidth * vertexFactorMap[4][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[4][0] ),
								(x * wallWidth)- artworkDistanceFromWall, (wallWidth * vertexFactorMap[5][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[5][0] ) ];
			} else if( face == 3 ) { //east
				vertexPositions = [ ((x+1) * wallWidth) + artworkDistanceFromWall, (wallWidth * vertexFactorMap[0][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[0][0] ),
								((x+1) * wallWidth) + artworkDistanceFromWall, (wallWidth * vertexFactorMap[1][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[1][0] ),
								((x+1) * wallWidth) + artworkDistanceFromWall, (wallWidth * vertexFactorMap[2][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[2][0] ),
								((x+1) * wallWidth) + artworkDistanceFromWall, (wallWidth * vertexFactorMap[3][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[3][0] ),
								((x+1) * wallWidth) + artworkDistanceFromWall, (wallWidth * vertexFactorMap[4][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[4][0] ),
								((x+1) * wallWidth) + artworkDistanceFromWall, (wallWidth * vertexFactorMap[5][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[5][0] ) ];
			} else if( face == 0 ) { //north?
				vertexPositions = [ (x * wallWidth) + (wallWidth * vertexFactorMap[0][0] ) ,
									(wallWidth * vertexFactorMap[0][1]), (y * wallWidth) - artworkDistanceFromWall,
								(x * wallWidth) + (wallWidth * vertexFactorMap[1][0] ),
									(wallWidth * vertexFactorMap[1][1]), (y * wallWidth) - artworkDistanceFromWall,
								(x * wallWidth) + (wallWidth * vertexFactorMap[2][0] ),
									(wallWidth * vertexFactorMap[2][1]), (y * wallWidth) - artworkDistanceFromWall,
								(x * wallWidth) + (wallWidth * vertexFactorMap[3][0] ),
									(wallWidth * vertexFactorMap[3][1]), (y * wallWidth) - artworkDistanceFromWall,
								(x * wallWidth) + (wallWidth * vertexFactorMap[4][0] ),
									(wallWidth * vertexFactorMap[4][1]), (y * wallWidth) - artworkDistanceFromWall,
								(x * wallWidth) + (wallWidth * vertexFactorMap[5][0] ),
									(wallWidth * vertexFactorMap[5][1]), (y * wallWidth) - artworkDistanceFromWall ];
			} else if( face == 1 ) { //south
				vertexPositions = [ (x * wallWidth) + (wallWidth * vertexFactorMap[0][0] ),
									(wallWidth * vertexFactorMap[0][1]), ((y+1) * wallWidth) + artworkDistanceFromWall,
								(x * wallWidth) + (wallWidth * vertexFactorMap[1][0] ),
									(wallWidth * vertexFactorMap[1][1]), ((y+1) * wallWidth) + artworkDistanceFromWall,
								(x * wallWidth) + (wallWidth * vertexFactorMap[2][0] ),
									(wallWidth * vertexFactorMap[2][1]), ((y+1) * wallWidth) + artworkDistanceFromWall,
								(x * wallWidth) + (wallWidth * vertexFactorMap[3][0] ),
									(wallWidth * vertexFactorMap[3][1]), ((y+1) * wallWidth) + artworkDistanceFromWall,
								(x * wallWidth) + (wallWidth * vertexFactorMap[4][0] ),
									(wallWidth * vertexFactorMap[4][1]), ((y+1) * wallWidth) + artworkDistanceFromWall,
								(x * wallWidth) + (wallWidth * vertexFactorMap[5][0] ),
									(wallWidth * vertexFactorMap[5][1]), ((y+1) * wallWidth) + artworkDistanceFromWall ];
			}
		var vertexCount = 6;
		
		// push vertical walls to GL arrays
		artworksVertexPositionBuffer[numArtworks] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, artworksVertexPositionBuffer[numArtworks]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.DYNAMIC_DRAW);
        artworksVertexPositionBuffer[numArtworks].itemSize = 3;
        artworksVertexPositionBuffer[numArtworks].numItems = vertexCount;

        artworksTextureCoordBuffer[numArtworks] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, artworksTextureCoordBuffer[numArtworks]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
        artworksTextureCoordBuffer[numArtworks].itemSize = 2;
        artworksTextureCoordBuffer[numArtworks].numItems = vertexCount;
		
		numArtworks++;
	}
	
	function pushVertexToArrays( spacialCoords, textureCoords, x, y, z, u, v ) {
		spacialCoords.push(x);
		spacialCoords.push(y);
		spacialCoords.push(z);
		textureCoords.push(u);
		textureCoords.push(v);
	}
	
	var numberOfLoadedFiles = 0;

	
    function loadWorld() {		
		initFloorAndCeiling();
		initWalls();
		createHighlighter();
		
        document.getElementById("loadingtext").textContent = "";
    }

	
    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		if (buildingLayoutVertexTextureCoordBuffer == null || buildingLayoutVertexPositionBuffer == null ) {
            return;
		}

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 200.0, pMatrix);

        mat4.identity(mvMatrix);

        mat4.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0]);
        mat4.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0]);
        mat4.translate(mvMatrix, [-xPos, -yPos, -zPos]);
		
		buildFloorAndCeiling();
		buildWalls();

		// Draw building layout
		for( var i = 0 ; i < 4 ; i++ ) {
			gl.activeTexture(gl.TEXTURE0 + i);
			gl.bindTexture(gl.TEXTURE_2D, buildingTextures[buildingLayoutTextureNumber[i]]);
			//gl.bindTexture(gl.TEXTURE_2D, buildingTextures[0]);
			gl.uniform1i(shaderProgram.samplerUniform, i);

			gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexTextureCoordBuffer[i]);
			gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, buildingLayoutVertexTextureCoordBuffer[i].itemSize, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, buildingLayoutVertexPositionBuffer[i]);
			gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, buildingLayoutVertexPositionBuffer[i].itemSize, gl.FLOAT, false, 0, 0);

			setMatrixUniforms();
			gl.drawArrays(gl.TRIANGLES, 0, buildingLayoutVertexPositionBuffer[i].numItems);
		}
		for( var i = 0 ; i < numArtworks ; i++ ) {
			//var artworksVertexPositionBuffer = [];
			//var artworksTextureCoordBuffer = [];
			//var artworksTextureNumber = [];
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, artworksTextures[artworks[i].subscript]);
			gl.uniform1i(shaderProgram.samplerUniform, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, artworksTextureCoordBuffer[i]);
			gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, artworksTextureCoordBuffer[i].itemSize, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, artworksVertexPositionBuffer[i]);
			gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, artworksVertexPositionBuffer[i].itemSize, gl.FLOAT, false, 0, 0);

			setMatrixUniforms();
			gl.drawArrays(gl.TRIANGLES, 0, artworksVertexPositionBuffer[i].numItems);
		}
		if( highlighterIsOn ) {
			gl.activeTexture(gl.TEXTURE0  );
			//gl.bindTexture(gl.TEXTURE_2D, buildingTextures[1]);
			gl.bindTexture(gl.TEXTURE_2D, highlighterTextures[highlighterTextureNumber]);
			gl.uniform1i(shaderProgram.samplerUniform, 0 );

			gl.bindBuffer(gl.ARRAY_BUFFER, highlighterTextureCoordBuffer);
			gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, highlighterTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, highlighterVertexPositionBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, highlighterVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

			setMatrixUniforms();
			gl.drawArrays(gl.TRIANGLES, 0, highlighterVertexPositionBuffer.numItems);
		}
		
		// debug info
		document.getElementById("debugfeedback").textContent = xPos + ", " + yPos + "," + zPos;
        drawClickPos();
    }
	

    var lastTime = 0;
    // Used to make us "jog" up and down as we move forward.
    var joggingAngle = 0;

    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;

            if (speed != 0) {
                xPos -= Math.sin(degToRad(yaw)) * speed * elapsed;
                zPos -= Math.cos(degToRad(yaw)) * speed * elapsed;

                joggingAngle += elapsed * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)
                yPos = Math.sin(degToRad(joggingAngle)) / 20 + standingHeight
            }
			
			if( strafe != 0 ) {
				xPos -= Math.sin(degToRad(yaw)+(Math.PI/2)) * strafe * elapsed;
				zPos -= Math.cos(degToRad(yaw)+(Math.PI/2)) * strafe * elapsed;
			}

            yaw += yawRate * elapsed;
            pitch += pitchRate * elapsed;

        }
        lastTime = timeNow;
    }
	
	function tick() {
        requestAnimFrame(tick);
        handleKeys();
	    drawScene();
        animate();
        animate2();
    }


	
    function webGLStart() {
        var canvas = document.getElementById("lesson10-canvas");
        initGL(canvas);
        initShaders();
        initTexture();
        loadWorld();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;

        initInteraction();

        tick();
    }
	
	
	
	//-----------------------------------------------------------------
	
	
	function highlightPicker( x, y, z ) {
		// find 
		// 
	}
	
	// note: x, y refer to cubeMap[x][y] locations
	//		if wall, face is n/s/w/e is to 0/1/2/3
	function moveHighlighter( x, y, face ) {
		var distanceFromSurface = 0.1;
		var newVertices = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
			
		if( cubeMap[y][x] == 1  ) { // i.e. floor
				highlighterTextureNumber = highlighterFloorTextureSubscript;
				newVertices = [ (x * wallWidth) + (wallWidth * vertexFactorMap[0][0] ), distanceFromSurface,
									 (y * wallWidth) + (wallWidth * vertexFactorMap[0][1] ),
								(x * wallWidth) + (wallWidth * vertexFactorMap[1][0] ), distanceFromSurface,
									 (y * wallWidth) + (wallWidth * vertexFactorMap[1][1] ),
								(x * wallWidth) + (wallWidth * vertexFactorMap[2][0] ), distanceFromSurface,
									 (y * wallWidth) + (wallWidth * vertexFactorMap[2][1] ),
								(x * wallWidth) + (wallWidth * vertexFactorMap[3][0] ), distanceFromSurface,
									 (y * wallWidth) + (wallWidth * vertexFactorMap[3][1] ),
								(x * wallWidth) + (wallWidth * vertexFactorMap[4][0] ), distanceFromSurface,
									 (y * wallWidth) + (wallWidth * vertexFactorMap[4][1] ),
								(x * wallWidth) + (wallWidth * vertexFactorMap[5][0] ), distanceFromSurface,
									 (y * wallWidth) + (wallWidth * vertexFactorMap[5][1] ) ];
		} else if( cubeMap[y][x] == 0 ) { // wall block
			highlighterTextureNumber = highlighterWallTextureSubscript;
			if( face == 2 ) { //west
				newVertices = [ (x * wallWidth) - distanceFromSurface, (wallWidth * vertexFactorMap[0][1] ) ,
									(y * wallWidth) + (wallWidth * vertexFactorMap[0][0] ),
								(x * wallWidth)- distanceFromSurface, (wallWidth * vertexFactorMap[1][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[1][0] ),
								(x * wallWidth)- distanceFromSurface, (wallWidth * vertexFactorMap[2][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[2][0] ),
								(x * wallWidth)- distanceFromSurface, (wallWidth * vertexFactorMap[3][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[3][0] ),
								(x * wallWidth)- distanceFromSurface, (wallWidth * vertexFactorMap[4][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[4][0] ),
								(x * wallWidth)- distanceFromSurface, (wallWidth * vertexFactorMap[5][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[5][0] ) ];
			} else if( face == 3 ) { //east
				newVertices = [ ((x+1) * wallWidth) + distanceFromSurface, (wallWidth * vertexFactorMap[0][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[0][0] ),
								((x+1) * wallWidth) + distanceFromSurface, (wallWidth * vertexFactorMap[1][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[1][0] ),
								((x+1) * wallWidth) + distanceFromSurface, (wallWidth * vertexFactorMap[2][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[2][0] ),
								((x+1) * wallWidth) + distanceFromSurface, (wallWidth * vertexFactorMap[3][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[3][0] ),
								((x+1) * wallWidth) + distanceFromSurface, (wallWidth * vertexFactorMap[4][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[4][0] ),
								((x+1) * wallWidth) + distanceFromSurface, (wallWidth * vertexFactorMap[5][1] ),
									(y * wallWidth) + (wallWidth * vertexFactorMap[5][0] ) ];
			} else if( face == 0 ) { //north?
				newVertices = [ (x * wallWidth) + (wallWidth * vertexFactorMap[0][0] ) ,
									(wallWidth * vertexFactorMap[0][1]), (y * wallWidth) - distanceFromSurface,
								(x * wallWidth) + (wallWidth * vertexFactorMap[1][0] ),
									(wallWidth * vertexFactorMap[1][1]), (y * wallWidth) - distanceFromSurface,
								(x * wallWidth) + (wallWidth * vertexFactorMap[2][0] ),
									(wallWidth * vertexFactorMap[2][1]), (y * wallWidth) - distanceFromSurface,
								(x * wallWidth) + (wallWidth * vertexFactorMap[3][0] ),
									(wallWidth * vertexFactorMap[3][1]), (y * wallWidth) - distanceFromSurface,
								(x * wallWidth) + (wallWidth * vertexFactorMap[4][0] ),
									(wallWidth * vertexFactorMap[4][1]), (y * wallWidth) - distanceFromSurface,
								(x * wallWidth) + (wallWidth * vertexFactorMap[5][0] ),
									(wallWidth * vertexFactorMap[5][1]), (y * wallWidth) - distanceFromSurface ];
			} else if( face == 1 ) { //south
				newVertices = [ (x * wallWidth) + (wallWidth * vertexFactorMap[0][0] ),
									(wallWidth * vertexFactorMap[0][1]), ((y+1) * wallWidth) + distanceFromSurface,
								(x * wallWidth) + (wallWidth * vertexFactorMap[1][0] ),
									(wallWidth * vertexFactorMap[1][1]), ((y+1) * wallWidth) + distanceFromSurface,
								(x * wallWidth) + (wallWidth * vertexFactorMap[2][0] ),
									(wallWidth * vertexFactorMap[2][1]), ((y+1) * wallWidth) + distanceFromSurface,
								(x * wallWidth) + (wallWidth * vertexFactorMap[3][0] ),
									(wallWidth * vertexFactorMap[3][1]), ((y+1) * wallWidth) + distanceFromSurface,
								(x * wallWidth) + (wallWidth * vertexFactorMap[4][0] ),
									(wallWidth * vertexFactorMap[4][1]), ((y+1) * wallWidth) + distanceFromSurface,
								(x * wallWidth) + (wallWidth * vertexFactorMap[5][0] ),
									(wallWidth * vertexFactorMap[5][1]), ((y+1) * wallWidth) + distanceFromSurface ];
			}
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, highlighterVertexPositionBuffer);
		gl.bufferSubData( gl.ARRAY_BUFFER, 0, new Float32Array(newVertices) );
		//highlighterIsOn = false;
	}
	
	function toggleHighlighter( val ) {
		highlighterIsOn = val;
	}

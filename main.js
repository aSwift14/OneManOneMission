var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

// Delta Time
var startFrameMillis = Date.now();
var endFrameMillis = Date.now();


function getDeltaTime() {
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;

	if (deltaTime > 1)
		deltaTime = 1;

	return deltaTime;
}

//Game States
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;

var gameState = STATE_SPLASH;

var splashTimer = 3;
var gameOverTimer = 5;

// Screen Variables
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

//Keyboard Variables
var KEY_SPACE = 32;
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_ESCAPE = 27;

// Tileset Variables
var LAYER_COUNT = 6;
var MAP = { tw: 59, th: 14 };
var TILE = 35;
var TILESET_TILE = TILE * 2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;

// Player Movement Variable (Physics)

// abitrary choice for 1m
var METER = TILE;
// very exaggerated gravity (6x)
var GRAVITY = METER * 9.8 * 3.2;
// max horizontal speed (10 tiles per second)
var MAXDX = METER * 10;
// max vertical speed (15 tiles per second)
var MAXDY = METER * 15;
// horizontal acceleration - take 1/2 second to reach maxdx
var ACCEL = MAXDX * 2;
// horizontal friction - take 1/6 second to stop from maxdx
var FRICTION = MAXDX * 6;
// (a large) instantaneous jump impulse
var JUMP = METER * 1500;

// Player Variables
var chuckNorris = document.createElement("img");

chuckNorris.src = "hero.png";

var player = new Player();
var keyboard = new Keyboard();

// Set Tileset
var tileset = document.createElement("img");
tileset.src = "tileset.png";

// Collision Variables
var LAYER_COUNT = 6;
var LAYER_BACKGOUND = 0;
var LAYER_HOUSE = 1;
var LAYER_CRATES = 2;
var LAYER_PLATFORMS = 3;
var LAYER_OBJECTIVES = 4;
var LAYER_LADDERS = 5;

// Create Collision Maps
function cellAtPixelCoord(layer, x, y) {
	if (x < 0 || x > SCREEN_WIDTH || y < 0)
		return 1;
	// let the player drop of the bottom of the screen (this means death)
	if (y > SCREEN_HEIGHT)
		return 0;
	return cellAtTileCoord(layer, p2t(x), p2t(y));
};
function cellAtTileCoord(layer, tx, ty) {
	if (tx < 0 || tx >= MAP.tw || ty < 0)
		return 1;
	// let the player drop of the bottom of the screen (this means death)
	if (ty >= MAP.th)
		return 0;
	return cells[layer][ty][tx];
};
function tileToPixel(tile) {
	return tile * TILE;
};
function pixelToTile(pixel) {
	return Math.floor(pixel / TILE);
};
function bound(value, min, max) {
	if (value < min)
		return min;
	if (value > max)
		return max;
	return value;
}

// Draw Map
function drawMap() {
	for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) {
		var idx = 0;
		for (var y = 0; y < level1.layers[layerIdx].height; y++) {
			for (var x = 0; x < level1.layers[layerIdx].width; x++) {
				if (level1.layers[layerIdx].data[idx] != 0) {
					var tileIndex = level1.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_X)) * (TILESET_TILE + TILESET_SPACING);
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, x * TILE, (y - 1) * TILE, TILESET_TILE, TILESET_TILE);
				}
				idx++;
			}
		}
	}
}

// Set Collision Variable
var cells = []; // the array that holds our simplified collision data
function initialize() {
	for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) { // initialize the collision map
		cells[layerIdx] = [];
		var idx = 0;
		for (var y = 0; y < level1.layers[layerIdx].height; y++) {
			cells[layerIdx][y] = [];
			for (var x = 0; x < level1.layers[layerIdx].width; x++) {
				if (level1.layers[layerIdx].data[idx] != 0) {
					// for each tile we find in the layer data, we need to create 4 collisions
					// (because our collision squares are 35x35 but the tile in the
					// level are 70x70)
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y - 1][x] = 1;
					cells[layerIdx][y - 1][x + 1] = 1;
					cells[layerIdx][y][x + 1] = 1;
				}
				else if (cells[layerIdx][y][x] != 1) {
					// if we haven't set this cell's value, then set it to 0 now
					cells[layerIdx][y][x] = 0;
				}
				idx++;
			}
		}
	}
}

// Run Function
function run() {
	context.fillStyle = "#ccc";
	context.fillRect(0, 0, canvas.width, canvas.height);

	var deltaTime = getDeltaTime();

	    switch(gameState)
    {
        case STATE_SPLASH:
            runSplash(deltaTime);
            break;
        case STATE_GAME:
            runGame(deltaTime);
            break;
        case STATE_GAMEOVER:
            runGameOver(deltaTime);
            break;
    }


	fpsTime += deltaTime;
	fpsCount++;
	if (fpsTime >= 1) {
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}
	// draw the FPS
	context.fillStyle = "#f00";
	context.font = "14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
}

initialize();

function runSplash(deltaTime)
{
	splashTimer -= deltaTime;
    if (splashTimer <= 0)
    {
        gameState = STATE_GAME;
        return;
    }

			context.fillStyle = "#000";
			context.font = "24px Arial";
			context.fillText("Welcome to A Platformer,", 200, 240);

			context.fillStyle = "#000";
			context.font = "16px Arial";
			context.fillText("By Aaron Swift", 200, 268);
}

function runGame(deltaTime) 
{
	drawMap();
	player.update(deltaTime);
	player.draw();
	
	if(Vector2.x > SCREEN_HEIGHT) {
		gameOverTimer -= deltaTime;
		console.log(SCREEN_HEIGHT);
		if (gameOverTimer <= 0)
		{
			gameState = STATE_GAMEOVER;
			return;
		}
	}

}
function runGameOver(deltaTime) 
{
			context.fillStyle = "#000";
			context.font = "24px Arial";
			context.fillText("GAME OVER", 200, 240);

			context.fillStyle = "#000";
			context.font = "16px Arial";
			context.fillText("Press ESC to Restart!", 200, 268);

			if (keyboard.isKeyDown(KEY_ESCAPE) == true)
			{
				gameState = STATE_GAME;
				return;
			}
}

//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function () {
	var onEachFrame;
	if (window.requestAnimationFrame) {
		onEachFrame = function (cb) {
			var _cb = function () { cb(); window.requestAnimationFrame(_cb); }
			_cb();
		};
	} else if (window.mozRequestAnimationFrame) {
		onEachFrame = function (cb) {
			var _cb = function () { cb(); window.mozRequestAnimationFrame(_cb); }
			_cb();
		};
	} else {
		onEachFrame = function (cb) {
			setInterval(cb, 1000 / 60);
		}
	}

	window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);



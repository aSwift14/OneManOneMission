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

//Level Variables
var LEVEL_1 = 0;
var LEVEL_1_ROOM = 1;

var levelState = LEVEL_1;

//Game Variables
var lives = 3;

// Screen Variables
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

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
var LAYER_COUNT = 7;
var LAYER_BACKGOUND = 0;
var LAYER_WATER = 1;
var LAYER_DOORS = 2;
var LAYER_CRATES = 3;
var LAYER_PLATFORMS = 4;
var LAYER_OBJECTIVES = 5;
var LAYER_LADDERS = 6;

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


// Draw Map w/ Side Scrolling
var worldOffsetX =0;

function drawMap() {
	var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
	var tileX = pixelToTile(player.position.x);
	var offsetX = TILE + Math.floor(player.position.x%TILE);

	startX = tileX - Math.floor(maxTiles / 2);
	if (startX < -1) {
		startX = 0;
		offsetX = 0;
	}
	if (startX > MAP.tw - maxTiles) {
		startX = MAP.tw - maxTiles + 1;
		offsetX = TILE;
	}
	worldOffsetX = startX * TILE + offsetX;


	if (levelState == LEVEL_1) {
		for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) {
			for (var y = 0; y < level1.layers[layerIdx].height; y++) {
				var idx = y * level1.layers[layerIdx].width + startX;
				for (var x = startX; x < startX + maxTiles; x++) {
					if (level1.layers[layerIdx].data[idx] != 0) {
						// the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile),
						// so subtract one from the tileset id to get the
						// correct tile
						var tileIndex = level1.layers[layerIdx].data[idx] - 1;
						var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) *
							(TILESET_TILE + TILESET_SPACING);
						var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) *
							(TILESET_TILE + TILESET_SPACING);
						context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
							(x - startX) * TILE - offsetX, (y - 1) * TILE, TILESET_TILE, TILESET_TILE);
					}
					idx++;
				}
			}
		}
	}
	if (levelState == LEVEL_1_ROOM) {
		for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) {
			for (var y = 0; y < level1Room.layers[layerIdx].height; y++) {
				var idx = y * level1Room.layers[layerIdx].width + startX;
				for (var x = startX; x < startX + maxTiles; x++) {
					if (level1Room.layers[layerIdx].data[idx] != 0) {
						// the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile),
						// so subtract one from the tileset id to get the
						// correct tile
						var tileIndex = level1Room.layers[layerIdx].data[idx] - 1;
						var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) *
							(TILESET_TILE + TILESET_SPACING);
						var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) *
							(TILESET_TILE + TILESET_SPACING);
						context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
							(x - startX) * TILE - offsetX, (y - 1) * TILE, TILESET_TILE, TILESET_TILE);
					}
					idx++;
				}
			}
		}
	}
}

// Intitialize
var cells = [];

var musicBackground;
var sfxFire;

function initialize() {
	if (levelState == LEVEL_1) {
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
		cells[LAYER_WATER] = [];
		idx = 0;
		for (var y = 0; y < level1.layers[LAYER_WATER].height; y++) {
			cells[LAYER_WATER][y] = [];
			for (var x = 0; x < level1.layers[LAYER_WATER].width; x++) {
				if (level1.layers[LAYER_WATER].data[idx] != 0) {
					cells[LAYER_WATER][y][x] = 1;
					cells[LAYER_WATER][y - 1][x] = 1;
					cells[LAYER_WATER][y - 1][x + 1] = 1;
					cells[LAYER_WATER][y][x + 1] = 1;
				}
				else if (cells[LAYER_WATER][y][x] != 1) {
					// if we haven't set this cell's value, then set it to 0 now
					cells[LAYER_WATER][y][x] = 0;
				}
				idx++;
			}
		}
		cells[LAYER_OBJECTIVES] = [];
		idx = 0;
		for (var y = 0; y < level1.layers[LAYER_OBJECTIVES].height; y++) {
			cells[LAYER_OBJECTIVES][y] = [];
			for (var x = 0; x < level1.layers[LAYER_OBJECTIVES].width; x++) {
				if (level1.layers[LAYER_OBJECTIVES].data[idx] != 0) {
					cells[LAYER_OBJECTIVES][y][x] = 1;
					cells[LAYER_OBJECTIVES][y - 1][x] = 1;
					cells[LAYER_OBJECTIVES][y - 1][x + 1] = 1;
					cells[LAYER_OBJECTIVES][y][x + 1] = 1;
				}
				else if (cells[LAYER_WATER][y][x] != 1) {
					// if we haven't set this cell's value, then set it to 0 now
					cells[LAYER_WATER][y][x] = 0;
				}
				idx++;
			}
		}
		cells[LAYER_DOORS] = [];
		idx = 0;
		for (var y = 0; y < level1.layers[LAYER_DOORS].height; y++) {
			cells[LAYER_DOORS][y] = [];
			for (var x = 0; x < level1.layers[LAYER_DOORS].width; x++) {
				if (level1.layers[LAYER_DOORS].data[idx] != 0) {
					cells[LAYER_DOORS][y][x] = 1;
					cells[LAYER_DOORS][y - 1][x] = 1;
					cells[LAYER_DOORS][y - 1][x + 1] = 1;
					cells[LAYER_DOORS][y][x + 1] = 1;
				}
				else if (cells[LAYER_WATER][y][x] != 1) {
					// if we haven't set this cell's value, then set it to 0 now
					cells[LAYER_WATER][y][x] = 0;
				}
				idx++;
			}
		}
	}
	if (levelState == LEVEL_1_ROOM) {
		for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) { // initialize the collision map
			cells[layerIdx] = [];
			var idx = 0;
			for (var y = 0; y < level1Room.layers[layerIdx].height; y++) {
				cells[layerIdx][y] = [];
				for (var x = 0; x < level1Room.layers[layerIdx].width; x++) {
					if (level1Room.layers[layerIdx].data[idx] != 0) {
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
		cells[LAYER_WATER] = [];
		idx = 0;
		for (var y = 0; y < level1Room.layers[LAYER_WATER].height; y++) {
			cells[LAYER_WATER][y] = [];
			for (var x = 0; x < level1Room.layers[LAYER_WATER].width; x++) {
				if (level1Room.layers[LAYER_WATER].data[idx] != 0) {
					cells[LAYER_WATER][y][x] = 1;
					cells[LAYER_WATER][y - 1][x] = 1;
					cells[LAYER_WATER][y - 1][x + 1] = 1;
					cells[LAYER_WATER][y][x + 1] = 1;
				}
				else if (cells[LAYER_WATER][y][x] != 1) {
					// if we haven't set this cell's value, then set it to 0 now
					cells[LAYER_WATER][y][x] = 0;
				}
				idx++;
			}
		}
		cells[LAYER_OBJECTIVES] = [];
		idx = 0;
		for (var y = 0; y < level1Room.layers[LAYER_OBJECTIVES].height; y++) {
			cells[LAYER_OBJECTIVES][y] = [];
			for (var x = 0; x < level1Room.layers[LAYER_OBJECTIVES].width; x++) {
				if (level1Room.layers[LAYER_OBJECTIVES].data[idx] != 0) {
					cells[LAYER_OBJECTIVES][y][x] = 1;
					cells[LAYER_OBJECTIVES][y - 1][x] = 1;
					cells[LAYER_OBJECTIVES][y - 1][x + 1] = 1;
					cells[LAYER_OBJECTIVES][y][x + 1] = 1;
				}
				else if (cells[LAYER_WATER][y][x] != 1) {
					// if we haven't set this cell's value, then set it to 0 now
					cells[LAYER_WATER][y][x] = 0;
				}
				idx++;
			}
		}
		cells[LAYER_DOORS] = [];
		idx = 0;
		for (var y = 0; y < level1Room.layers[LAYER_DOORS].height; y++) {
			cells[LAYER_DOORS][y] = [];
			for (var x = 0; x < level1Room.layers[LAYER_DOORS].width; x++) {
				if (level1Room.layers[LAYER_DOORS].data[idx] != 0) {
					cells[LAYER_DOORS][y][x] = 1;
					cells[LAYER_DOORS][y - 1][x] = 1;
					cells[LAYER_DOORS][y - 1][x + 1] = 1;
					cells[LAYER_DOORS][y][x + 1] = 1;
				}
				else if (cells[LAYER_WATER][y][x] != 1) {
					// if we haven't set this cell's value, then set it to 0 now
					cells[LAYER_WATER][y][x] = 0;
				}
				idx++;
			}
		}
	}
	
	musicBackground = new Howl(
		{
			urls: [""],
			loop: true,
			buffer: true,
			volume: 0.18,
		});
	musicBackground.play();

	sfxFire = new Howl(
		{
			urls: ["fireEffect.ogg"],
			buffer: true,
			volume: 1,
			onend: function () {
				isSfxPlaying = false;
			}
		});
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
		switch(levelState)
    {
        case LEVEL_1:
			initialize();
            break;
        case LEVEL_1_ROOM:
			initialize();
            break;
    }


	fpsTime += deltaTime;
	fpsCount++;
	if (fpsTime >= 1) {
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}
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
	player.update(deltaTime);
	drawMap();
	player.draw()

	if(Vector2.x > SCREEN_HEIGHT) {
		gameOverTimer -= deltaTime;
		console.log(SCREEN_HEIGHT);
		if (gameOverTimer <= 0)
		{
			gameState = STATE_GAMEOVER;
			return;
		}
	}

	//Draw Time
    context.fillStyle = "#000";
    context.font = "16px Arial";
    context.fillText("Lives = " + lives, 8, 20);

}
function runGameOver(deltaTime) 
{
			context.fillStyle = "#000";
			context.font = "24px Arial";
			context.fillText("GAME OVER", 200, 240);

			context.fillStyle = "#000";
			context.font = "16px Arial";
			context.fillText("Press ESC to Restart!", 200, 268);

			if (keyboard.isKeyDown(keyboard.KEY_ESCAPE) == true)
			{
				gameState = STATE_GAME;
				gameOverTimer = 5;
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



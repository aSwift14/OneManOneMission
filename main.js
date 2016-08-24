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

// Screen Variables
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

// Tileset Variables
var LAYER_COUNT = 6;
var MAP = {tw: 59, th: 14};
var TILE = 35;
var TILESET_TILE = TILE * 2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;

// Player Variables
var chuckNorris = document.createElement("img");

chuckNorris.src = "hero.png";

var player = new Player();
var keyboard = new Keyboard();

// Set Tileset
var tileset = document.createElement("img");
tileset.src = "tileset.png";

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

// Run Function
function run() {
	context.fillStyle = "#ccc";
	context.fillRect(0, 0, canvas.width, canvas.height);

	var deltaTime = getDeltaTime();

	drawMap();
	player.update(deltaTime);
	player.draw();


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



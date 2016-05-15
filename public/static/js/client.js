// Function to initiate weboscket connection.
var Connection = function(){
	var host = window.location.host;
	var wsURL = 'ws://' + host + '/ws';
	var ws = new WebSocket(wsURL);

	ws.onopen = function (e) {
		console.log('Websocket open on: ' + wsURL);
	    var initMsg = JSON.stringify({type:"projection"});
		ws.send(initMsg);
	}
	ws.onclose = function (e) {
		console.log('WebSocket was closed');
	}
	ws.onmessage = function (e) {
		var msg = JSON.parse(e.data);
		if(msg.type === "control"){
			Game.update(msg);
		} else if (msg.type === "player"){
			document.querySelector("textarea").value += "New Player\n";
		} else if (msg.type === "disconnected"){
			document.querySelector("textarea").value += "Player Disconnected\n";
		}

	}
	ws.onerror = function (e) {
		console.log('Something went wrong with the connection');
	}
};

// Theme object to store colors and dimensions
// for material theme. Same as CSS colors.
var Theme = {
		color:{
			StatusBar: "#000000",
			AppBar: "#212121",
			Background: "#303030",
			Cards: "#424242",
			Main: "#2196F3",
			MainDarker: "#1976D2",
			MainLighter: "#64B5F6",
			Accent: "#F50057"
		},
		dimension:{
			margin: 4 
	}
};

// Game module. In here module pattern is used 
// (function(){})();
// like this alld of the methods defined inside
// Game are private to hide them from global scope.
// Methods which are available from global scope:
// update(msg) - takes in json object representing
// game update message and applies it to player.
// resizeCanvas() - method to make the canvas
// and text area fill in the main browser window
// nicely.
// init() - this will initialize the whole game
// once document is loaded.
// Any methods which are preced with _ are private.
var Game = (function(){
	var BALL_SPEED = 5;

	var canvas, context, paddleLeft, paddleRight, ball;
	// Classes for game objects
	// most of the default are
	// overwritten on load.
	
	// all the getters and setters
	// are defined as convinience
	// functions to make manipulation
	// of objects easier.

	// Players controlled paddle
	// Constructor
	var Paddle = function (x) {
		this.x = x;
	};
	// Properties of all paddles
	Paddle.prototype = {
		color: Theme.color.Main,
		x: 5,
		y: 10,
		width: 20,
		height: 100,
		alpha: 1,

		// Draw paddle onto the canvas
		draw: function(){
			context.fillStyle = this.color;
			context.fillRect(this.x, this.y, this.width, this.height);
		},

		// Getters
		get center(){
			x = this.x + this.width / 2;
			y = this.y + this.height / 2;
			return {x: x, y: y};
		},
		get top(){
			return this.y;
		},
		get bottom(){
			return this.y + this.height;
		},
		get right(){
			return this.x + this.width;
		},
		get left(){
			return this.x;
		},

		// Setters
		set top(dist){
			this.y = dist;
		},
		set bottom(dist){
			this.y = dist - this.height;
		},
		set right(dist){
			this.x = dist - this.width;
		},
		set left(dist){
			this.x = dist;
		}
	};

	// Ball constructor is just generic
	// function object
	function Ball(){};
	// Properties of the ball
	Ball.prototype = {
		color: Theme.color.Accent,
		x: 100,
		y: 200,
		vx: BALL_SPEED,
		vy: BALL_SPEED,
		radius: 25,
		alpha: 1,
		draw: function(){
			context.beginPath();
			context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
			context.closePath();
			context.fillStyle = this.color;
			context.fill();
		},
		// getters
		get center(){
			return {x: this.x, y: this.y};
		},
		get top(){
			return this.y - this.radius;
		},
		get bottom(){
			return this.y + this.radius;
		},
		get right(){
			return this.x + this.radius;
		},
		get left(){
			return this.x - this.radius;
		},
		// setters
		set top(dist){
			this.y = dist + this.radius;
		},
		set bottom(dist){
			this.y = dist - this.radius;
		},
		set right(dist){
			this.x = dist - this.radius;
		},
		set left(dist){
			this.x = dist + this.radius;
		}
	};


	// These are private methods of Game module
	// used for game physics

	// Make sure that players paddles stay on the
	// canvas
	var _checkWorldBoundaries = function (sprite){
		if (sprite.top < 0) {
			sprite.top = 0;
		} else if  (sprite.bottom > canvas.height){
			sprite.bottom = canvas.height;
		}
	}

	// Bounce the ball in canvas
	var _bounceTheBall = function (sprite){
		if (sprite.top < 0 || sprite.bottom > canvas.height) {
			sprite.vy = -sprite.vy;
		}
		if  (sprite.right > canvas.width || sprite.left < 0){
			sprite.vx = -sprite.vx;
		}
	}

	// Use paddle to hit the ball
	var _checkForCollision = function (paddle, ball){
			if(ball.left < paddle.right &&
				ball.right > paddle.left &&
				ball.top < paddle.bottom &&
				ball.bottom > paddle.top){
					ball.vx = -ball.vx;
			}
	}

	// Game update loop which cleares canvas,
	// checks for collision and updates elements.
	// by using requestAnimationFrame it suppose to
	// keep 60Fps refresh rate
	var _render = function () {
		context.clearRect(0, 0, canvas.width, canvas.height);

		_checkWorldBoundaries(paddleLeft);
		_checkWorldBoundaries(paddleRight);
		_bounceTheBall(ball);

		_checkForCollision(paddleLeft, ball);
		_checkForCollision(paddleRight, ball);

		ball.draw();
		paddleLeft.draw();
		paddleRight.draw();

		ball.x += ball.vx;
		ball.y += ball.vy;

		window.requestAnimationFrame(_render);
	}

	// Entry point for the game
	var init = function(){
		canvas = document.getElementById('cnv');
		context = canvas.getContext('2d');
		paddleLeft = new Paddle(10);
		paddleRight = new Paddle(canvas.width - 10);
		ball = new Ball();
		resizeCanvas();
		new Connection();
		_render();
	}

	// Update players with messge from
	// connection
	var update = function(msg){
		switch(msg.id){
			case 2:
				paddleLeft.y += msg.y;
				break;
			case 3:
				paddleRight.y += msg.y;
				break;
		} 
	};

	// This is called once on in init
	// stage and then attached to window
	// resize event
	var resizeCanvas = function (){
		var body = document.querySelector("body");
		var width = body.offsetWidth;
		var height = body.offsetHeight;
		var txtAreaWidth = document.querySelector("textarea").offsetWidth;
		canvas.width = width - txtAreaWidth - Theme.dimension.margin * 6;
		canvas.height = height - Theme.dimension.margin * 4;

		paddleRight.right = canvas.width - 10;
	}

	// Object litteral is returned
	// which makes certain methods
	// available for global scope
	return {
		init: init,
		update: update,
		resizeCanvas: resizeCanvas
	}
})();

window.addEventListener("resize", Game.resizeCanvas, false);
window.onload  = Game.init();

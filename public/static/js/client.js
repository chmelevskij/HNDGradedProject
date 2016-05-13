// Constants
var BALL_SPEED = 5;

//  Dark Theme Colors
var dtStatusBar = "#000000";
var dtAppBar = "#212121";
var dtBackground = "#303030";
var dtCards = "#424242";
var dtMain = "#2196F3";
var dtMainDarker = "#1976D2";
var dtMainLighter = "#64B5F6";
var dtAccent = "#F50057";

// Classes
var Paddle = function (x) {
	this.x = x;
};
Paddle.constructor = Paddle;
Paddle.prototype = {
	color: dtMainDarker,
	x: 5,
	y: 10,
	width: 20,
	height: 100,
	alpha: 1,
	draw: function(){
		context.fillStyle = this.color;
		context.fillRect(this.x, this.y, this.width, this.height);
	},
	// getters
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
	// setters
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

function Ball(){};
Ball.prototype = {
	color: dtAccent,
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

// Rendering
var canvas = document.getElementById('cnv'),
	context = canvas.getContext('2d'),
	paddleLeft = new Paddle(5),
	paddleRight = new Paddle(canvas.width - 25),
	ball = new Ball();

function checkWorldBoundaries(sprite){
	if (sprite.top < 0) {
		sprite.top = 0;
	} else if  (sprite.bottom > canvas.height){
		sprite.bottom = canvas.height;
	}
}

function bounceTheBall(sprite){
	if (sprite.top < 0 || sprite.bottom > canvas.height) {
		sprite.vy = -sprite.vy;
	}
	if  (sprite.right > canvas.width || sprite.left < 0){
		sprite.vx = -sprite.vx;
	}
}

function checkForCollision(paddle, ball){
		if(ball.left < paddle.right &&
			ball.right > paddle.left &&
			ball.top < paddle.bottom &&
			ball.bottom > paddle.top){
				ball.vx = -ball.vx;
		}
}

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);

	checkWorldBoundaries(paddleLeft);
	checkWorldBoundaries(paddleRight);
	bounceTheBall(ball);

	checkForCollision(paddleLeft, ball);
	checkForCollision(paddleRight, ball);

	ball.draw();
	paddleLeft.draw();
	paddleRight.draw();

	ball.x += ball.vx;
	ball.y += ball.vy;

	window.requestAnimationFrame(render);
}
render();

// Connection
var host = window.location.host,
wsURL = 'ws://' + host + '/ws';
ws = new WebSocket(wsURL);
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
		switch(msg.id){
			case 2:
				paddleLeft.y += msg.y;
				break;
			case 3:
				paddleRight.y += msg.y;
				break;
		}
	}

}
ws.onerror = function (e) {
	console.log('Something went wrong with the connection');
}

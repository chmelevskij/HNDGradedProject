// Check if browser supported
var hasWebSocket = 'WebSocket' in window;
var hasMotionEvent = 'DeviceMotionEvent' in window;

// Script to initialize connection
function init() {
	// Setup websocket
	var host = window.location.host;
	var wsURL = 'ws://' + host + '/ws';
	var ws = new WebSocket(wsURL);
	var gameInfo = document.querySelector("#info");
	
	// Events for websocket
	ws.onopen = function(e) {
		console.log('Websocket open on: ' + wsURL);
		var initMsg = JSON.stringify({type:"player"});
		ws.send(initMsg);
		gameInfo.innerHTML = "Connected";
	}
	ws.onclose = function(e) {
		console.log('WebSocket was closed');
		gameInfo.innerHTML = "Disconnected";
		var msg = JSON.stringify({type: "disconnected"});
		ws.send(msg);
	}
	ws.onmessage = function(e) {
		console.log('Received message from server:\n' + e.data);
	}
	ws.onerror = function(e) {
		console.log('Something went wrong with the connection');
	}

	// Show arrows
	function showDirection(accl){
		var up = document.getElementById('up');
		var down = document.getElementById('down');
		if (accl > 1) {
			down.style.visibility = 'visible';
		} else {
			down.style.visibility = 'hidden';
		}
		if (accl < -1) {
			up.style.visibility = 'visible';
		} else {
			up.style.visibility = 'hidden';
		}
	}

	// Sends motion data to socket
	function sendAcceleration(acclY){
		// send only values
		if (acclY > 1 || acclY < -1){
			var acceleration = {type: "control", y:acclY};
			var msg = JSON.stringify(acceleration);
			ws.send(msg);
		}
	}

	// CONTROLLERS
	// 
	// Accelerometer
	function motionControls(event) {
		var acclY = Math.round(event.acceleration.y * 5);
		sendAcceleration(acclY);
		showDirection(acclY);
	}

	// Keyboard
	function keyboardControls(event){
		var acclY;
		switch(event.keyCode){
			// KEY_UP
			case 38:
				acclY = -20;
				break;
			// KEY_DOWN
			case 40:
				acclY = 20;
				break;
			default:
				acclY = 0;
		}
		sendAcceleration(acclY);
		showDirection(acclY);

	}

	// Attach events to functions
	window.addEventListener('keydown', keyboardControls);
	window.addEventListener('devicemotion', motionControls);
}

// Only connect if browser supports websockets
if (hasWebSocket) {
	init();
} else {
	alert('Please use browser with WebSocket');
}

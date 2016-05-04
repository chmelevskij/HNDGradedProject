// Check if browser supported
var hasWebSocket = 'WebSocket' in window,
	hasMotionEvent = 'DeviceMotionEvent' in window;
// Script to initialize connection
function init() {
	// Setup websocket
	var host = window.location.host,
		wsURL = 'ws://' + host + '/ws',
		ws = new WebSocket(wsURL);
	ws.onopen = function(e) {
		console.log('Websocket open on: ' + wsURL);
		var initMsg = JSON.stringify({type:"player"});
		ws.send(initMsg);
	}
	ws.onclose = function(e) {
		console.log('WebSocket was closed');
	}
	ws.onmessage = function(e) {
		console.log('Received message from server:\n' + e.data);
	}
	ws.onerror = function(e) {
		console.log('Something went wrong with the connection');
	}

	function motionControls(event) {
		var up = document.getElementById('up'),
			down = document.getElementById('down');
		var acclY = Math.round(event.acceleration.y * 5);
		var acceleration = {type: "control", y:acclY};
		var msg = JSON.stringify(acceleration);
		console.log(msg);
		if (acclY > 0) {
			up.style.visibility = 'visible';
			ws.send(msg);
		} else {
			up.style.visibility = 'hidden';
		}
		if (acclY < 0) {
			down.style.visibility = 'visible';
			ws.send(msg);
		} else {
			down.style.visibility = 'hidden';
		}
	}

	function keyboardControls(event){
		var up = document.getElementById('up'),
			down = document.getElementById('down');
		var acclY;
		switch(event.keyCode){
			case 38:
				acclY = -20;
				break;
			case 40:
				acclY = 20;
				break;
			default:
				acclY = 0;
		}
		var acceleration = {type: "control", y:acclY};
		var msg = JSON.stringify(acceleration);
		if (acclY > 0) {
			down.style.visibility = 'visible';
			ws.send(msg);
		} else {
			down.style.visibility = 'hidden';
		}
		if (acclY < 0) {
			up.style.visibility = 'visible';
			ws.send(msg);
		} else {
			up.style.visibility = 'hidden';
		}
	}
	window.addEventListener('keydown', keyboardControls);
	window.addEventListener('devicemotion', motionControls);
}
if (hasWebSocket) {
	init();
} else {
	console.log('Please use browser with motionEvent and websockets');
}

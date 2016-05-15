// Check if browser supported
var hasWebSocket = 'WebSocket' in window,
	hasMotionEvent = 'DeviceMotionEvent' in window;
// Script to initialize connection
function init() {
	// Setup websocket
	var host = window.location.host,
		wsURL = 'ws://' + host + '/ws',
		ws = new WebSocket(wsURL);
	var gameInfo = document.querySelector("#info");
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

	function showDirection(accl){
		var up = document.getElementById('up'),
			down = document.getElementById('down');
		if (accl > 0) {
			down.style.visibility = 'visible';
		} else {
			down.style.visibility = 'hidden';
		}
		if (accl < 0) {
			up.style.visibility = 'visible';
		} else {
			up.style.visibility = 'hidden';
		}

	}

	function sendAcceleration(acclY){
		if (acclY > 0 || acclY < 0){
			var acceleration = {type: "control", y:acclY};
			var msg = JSON.stringify(acceleration);
			ws.send(msg);
		}
	}
	function motionControls(event) {
		var acclY = Math.round(event.acceleration.y * 5);
		sendAcceleration(acclY);
		showDirection(acclY);
	}

	function keyboardControls(event){
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
		sendAcceleration(acclY);
		showDirection(acclY);

	}
	window.addEventListener('keydown', keyboardControls);
	window.addEventListener('devicemotion', motionControls);
}
if (hasWebSocket) {
	init();
} else {
	console.log('Please use browser with motionEvent and websockets');
}

var Paddle = function (){};
Paddle.constructor = Paddle;

function init(){
	var canvas = window.getElementById('cnv'),
		context = canvas.getContext('2d');

	var host = window.location.host,
		wsURL = "ws://" + host + "/ws";
		ws = new WebSocket(wsURL);

	ws.onopen = function (e){
		console.log("Websocket open on: " + wsURL);
	}

	ws.onclose = function (e){
		console.log("WebSocket was closed");
	}

	ws.onmessage = function (e){
		console.log("Received message from server:\n" + e.data);
		context.rect(20,20,150,100);
		context.stroke();
	}

	ws.onerror = function (e){
		console.log("Something went wrong with the connection");
	}
}
document.location
window.addEventListener('load', init, false);

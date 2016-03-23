// Utilities
var logger = document.getElementById('content');
function log(message) {
    logger.value += message + '\n';
}

// Classes
var Paddle = function () {
};
Paddle.constructor = Paddle;
Paddle.prototype = {
    color: 'rgb(0,0,0)',
    x: 10,
    y: 10,
    width: 20,
    height: 100,
    alpha: 1
}

// Rendering
var canvas = document.getElementById('cnv'),
context = canvas.getContext('2d'),
paddle = new Paddle();

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = paddle.color;
    if (paddle.y < 0 || isNaN(paddle.y)) {
        paddle.y = 0;
    } else if  (paddle.y > canvas.height|| isNaN(paddle.y)){
        paddle.y = canvas.height;
    }
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
    window.requestAnimationFrame(render);
}
render();

// Connection
var host = window.location.host,
wsURL = 'ws://' + host + '/ws';
ws = new WebSocket(wsURL);
ws.onopen = function (e) {
    console.log('Websocket open on: ' + wsURL);
}
ws.onclose = function (e) {
    console.log('WebSocket was closed');
}
ws.onmessage = function (e) {
    console.log('Received message from server:' + e.data);
    paddle.y += parseInt(e.data);
}
ws.onerror = function (e) {
    console.log('Something went wrong with the connection');
}

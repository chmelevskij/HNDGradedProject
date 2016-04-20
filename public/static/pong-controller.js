// Check if browser supported
var hasWebSocket = 'WebSocket' in window
  

, 
hasMotionEvent = 'DeviceMotionEvent' in window;
// Script to initialize connection
function init() {
    
    // Setup websocket
    var host = window.location.host
      
    
    , 
    wsURL = 'ws://' + host + '/ws'
      
    
    , 
    ws = new WebSocket(wsURL)
      
    
    , 
    lastVelocity = null ;
    ws.onopen = function(e) {
        console.log('Websocket open on: ' + wsURL);
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
    function showDirection(event) {
        var up = document.getElementById('up'), 
        down = document.getElementById('down');
	var accl = Math.round(event.acceleration.y * 5);
        if (accl > 0) {
            up.style.visibility = 'visible';
            ws.send(accl);
        } else {
            up.style.visibility = 'hidden';
        }
        if (accl < 0) {
            down.style.visibility = 'visible';
            ws.send(accl);
        
        } else {
            down.style.visibility = 'hidden';
        }
    }
    window.addEventListener('devicemotion', showDirection);
}
if (hasWebSocket) {
    init();
} else {
    console.log('Please use browser with motionEvent and websockets');
}

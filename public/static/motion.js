// Check if browser supported
var hasWebSocket = 'WebSocket' in window,
hasMotionEvent = 'DeviceMotionEvent' in window;
// Script to initialize connection
function init() {
    var host = window.location.host,
    wsURL = 'ws://' + host + '/ws',
    ws = new WebSocket(wsURL),
    lastVelocity = null;
    ws.onopen = function (e) {
        console.log('Websocket open on: ' + wsURL);
    }
    ws.onclose = function (e) {
        console.log('WebSocket was closed');
    }
    ws.onmessage = function (e) {
        console.log('Received message from server:\n' + e.data);
    }
    ws.onerror = function (e) {
        console.log('Something went wrong with the connection');
    }
    // ROTATION

    var ball = document.querySelector('.ball');
    var garden = document.querySelector('.garden');
    var tdX = document.querySelector('#x');
    var tdY = document.querySelector('#y');
    var tdZ = document.querySelector('#z');
    var tdGX = document.querySelector('#xg');
    var tdGY = document.querySelector('#yg');
    var tdGZ = document.querySelector('#zg');
    var maxX = garden.clientWidth - ball.clientWidth;
    var maxY = garden.clientHeight - ball.clientHeight;
    function handleOrientation(event) {
        var x = Math.round(event.beta);
        var y = Math.round(event.gamma);
        var z = Math.round(event.alpha);
        alpha.innerHTML = x;
        beta.innerHTML = y;
        gamma.innerHTML = z;
        // Because we don't want to have device upside down
        // we constrain the x value to the range [-90, 90]
        if (x > 90) {
            x = 90
        };
        if (x < - 180) {
            x = - 90
        };
        // To make computation easier we shift the range of
        // x and y to [0, 180]
        x += 90;
        y += 90;
        // 10 is half size of the ball
        // it center the positioning point to the center of the ball
        ball.style.top = (maxX * x / 180 - 10) + 'px';
        ball.style.left = (maxY * y / 180 - 10) + 'px';
    }
    window.addEventListener('deviceorientation', handleOrientation);
    // MOTION
    var maxXacceleration = 0;
    var maxYacceleration = 0;
    var maxZacceleration = 0;
    function showAccelerationInTable(event) {
        if (event.acceleration.x > maxXacceleration) {
            maxXacceleration = event.acceleration.x;
        }
        if (event.acceleration.y > maxYacceleration) {
            maxYacceleration = event.acceleration.y;
        }
        if (event.acceleration.z > maxZacceleration) {
            maxZacceleration = event.acceleration.z;
        }
        tdX.innerHTML = Math.round(maxXacceleration);
        tdY.innerHTML = Math.round(maxYacceleration);
        tdZ.innerHTML = Math.round(maxZacceleration);
    }
    
    var maxGXacceleration = 0;
    var maxGYacceleration = 0;
    var maxGZacceleration = 0;
    function showWithGAccelerationInTable(event) {
        if (event.accelerationIncludingGravity.x > maxGXacceleration) {
            maxGXacceleration = event.accelerationIncludingGravity.x;
        }
        if (event.accelerationIncludingGravity.y > maxGYacceleration) {
            maxGYacceleration = event.accelerationIncludingGravity.y;
        }
        if (event.accelerationIncludingGravity.z > maxGZacceleration) {
            maxGZacceleration = event.accelerationIncludingGravity.z;
        }
        tdGX.innerHTML = Math.round(maxGXacceleration);
        tdGY.innerHTML = Math.round(maxGYacceleration);
        tdGZ.innerHTML = Math.round(maxGZacceleration);
    }
    function showDirection(event) {
        var up = document.getElementById('up'),
        down = document.getElementById('down'),
        left = document.getElementById('left'),
        right = document.getElementById('right');
        var acclX = Math.round(event.acceleration.x),
        acclY = Math.round(event.acceleration.y);
        if (acclY > 1) {
            up.style.visibility = 'visible';
            ws.send(acclY);
        } else {
            up.style.visibility = 'hidden';
        }
        if (acclY < - 1) {
            down.style.visibility = 'visible';
            ws.send(acclY);
        } else {
            down.style.visibility = 'hidden';
        }
        if (acclX > 1) {
            left.style.visibility = 'visible';
        } else {
            left.style.visibility = 'hidden';
        }
        if (acclX < - 1) {
            right.style.visibility = 'visible';
        } else {
            right.style.visibility = 'hidden';
        }
    }
    window.addEventListener('devicemotion', showAccelerationInTable);
    window.addEventListener('devicemotion', showWithGAccelerationInTable);
    window.addEventListener('devicemotion', showDirection);
}
if (hasWebSocket) {
    init();
} else {
    console.log('Please use browser with motionEvent and websockets');
}

function getLCD() {
    var canvas = document.getElementById('lcd');
    var ctx = canvas.getContext('2d');
    return ctx;
}

function flushLCDBuffer1(buffer, w, h, lineSize) {
    var scale = 2;
    var lcd = getLCD();
    for (var y = 0; y < h; y += 1) {
        for (var x = 0; x < w; x += 1) {
            var ind = lineSize*y + x;
            var pixel = getValue(buffer + ind, "i8");
            if (pixel != 0) {
                lcd.fillStyle = '#000000';
            } else {
                lcd.fillStyle = '#E0E0E0';
            }
            lcd.fillRect(x*scale, y*scale, scale, scale);
        }
    }
}

function flushLCDBuffer(buffer, w, h, lineSize) {
    var scale = 2;
    var lcd = getLCD();

    var img = lcd.createImageData(w, h)

    for (var y = 0; y < h; y += 1) {
        for (var x = 0; x < w; x += 1) {
            var ind = lineSize*y + x;
            var pixel = getValue(buffer + ind, "i8");
            if (pixel != 0) {
                var i = ind*4;
                img.data[i] = 0;
                img.data[i+1] = 0;
                img.data[i+2] = 0;
                img.data[i+3] = 255;
            } else {
            }
        }
    }
    lcd.imageSmoothingEnabled = false;
    lcd.putImageData(img, 0, 0);
}

function lcdFlushBuffer(buffer) {
    flushLCDBuffer(buffer, 160, 96, 160);
}

function sendKey(key) {
    _sendKey(key);
}

var 		VK_PGUP =			0x20;
var 		VK_PGDN	=			0x21;
var 		VK_UP	=			0x22;
var 		VK_DOWN	=			0x23;
var 		VK_LEFT	=			0x24;
var 		VK_RIGHT=			0x25;
var 		VK_HELP	=			0x26;
var 		VK_ENTER=			0x27;
var 		VK_EXIT	=			0x28;

var 		VK_INSERT	=		0x30;
var 		VK_DEL		=		0x31;
var 		VK_MODIFY	=		0x32;
var 		VK_SEARCH	=		0x33;

function onKeyDown() {
    console.log(event.keyCode)
    switch (event.keyCode) {
        case 13:
            sendKey(VK_ENTER);
            break;
        case 72:
            sendKey(VK_HELP);
            break;
        case 70:
            sendKey(VK_SEARCH);
            break;
        case 83:
            sendKey(VK_SEARCH);
            break;
        case 32:
            sendKey(VK_EXIT);
            break;
        case 27:
            sendKey(VK_EXIT);
            break;
        case 38:
            sendKey(VK_UP);
            break;
        case 40:
            sendKey(VK_DOWN);
            break;
        case 37:
            sendKey(VK_LEFT);
            break;
        case 39:
            sendKey(VK_RIGHT);
            break;
    }
}

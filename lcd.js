function getLCD() {
    var canvas = document.getElementById('lcd');
    if (canvas.getContext === undefined) {
        alert("你的浏览器不支持HTML5");
    }
    var ctx = canvas.getContext('2d');
    return ctx;
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

function bin2hex (s) {

  var i, l, o = "", n;

  s += "";

  for (i = 0, l = s.length; i < l; i++) {
    n = s.charCodeAt(i).toString(16)
    o += n.length < 2 ? "0" + n : n;
  }

  return o;
}

function loadLib(files) {
    var reader = new FileReader();
    if (!reader) {
        alert("浏览器不支持载入文件");
    }
    reader.onload = function() {
        var data = bin2hex(reader.result);
        window.localStorage['baye//data/dat.lib'] = data;
        window.location.reload();
    }
    reader.readAsBinaryString(files[0]);
}

function clearLib() {
    window.localStorage.removeItem('baye//data/dat.lib');
    window.location.reload();
}

if (typeof(Storage) === "undefined") {
    alert("你的浏览器不支持存档");
}

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

function loadLibBin(bin) {
    var data = bin2hex(bin);
    window.localStorage['baye//data/dat.lib'] = data;
    redirect();
}

function loadLib(files) {
    loadLibFromFile(files[0]);
}

function loadLibFromFile(file) {
    var reader = new FileReader();
    if (!reader) {
        alert("浏览器不支持载入文件");
    }
    reader.onload = function() {
        loadLibBin(reader.result);
    }
    reader.readAsBinaryString(file);
}

function clearLib() {
    window.localStorage.removeItem('baye//data/dat.lib');
    window.localStorage.removeItem('baye/libname');
    redirect();
}

function getLibName() {
    return window.localStorage['baye/libname'];
}

if (typeof(Storage) === "undefined") {
    alert("你的浏览器不支持存档");
}


var layoutType = 0;
var lcdWidth = 160;
var lcdHeight = 96;
var keypadWidth = 250;


function fitKeyboardSize() {
    var w = document.body.clientWidth;
    var h = document.body.clientHeight;

    if (h / w > lcdHeight/lcdWidth) {
        var availableHeight = h - w * lcdHeight/lcdWidth;
        kbWidth = (layoutType == 0) ? w : keypadWidth;
        var ratio = availableHeight / 3 / kbWidth * 100;
        if (ratio > 30) {
            ratio = 30;
        }
        $(".dummy30").css("margin-top", ratio + "%");
        if (layoutType == 0) {
            $(".keypad").removeAttr("style");
        } else {
            $(".keypad").css("width", keypadWidth);
            $(".keypad").css("position", "absolute");
            $(".keypad").css("right", 0);
            $(".keypad").css("bottom", 10);
        }
    }
}

function switchLayout() {
    layoutType = (layoutType == 0) ? 1 : 0;
    fitKeyboardSize();
}

String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

function ajaxGet(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.responseType = 'blob';

    xhr.onload = function(e) {
      if (this.status == 200) {
        var blob = this.response;
        callback(blob);
      }
    };

    xhr.send();
}

function chooseLib(title, path, self_) {
    var self = $(self_);
    self.html("请稍候...");
    self.attr("disabled", "disabled");

    if (path && path.length > 0) {
        ajaxGet(path, function(blob) {
            loadLibFromFile(blob);
            window.localStorage['baye/libname'] = title;
        });
    } else {
        clearLib();
    }
}

function loadDetail(id, path) {
    var e = $(id);
    if (e.is(":hidden")) {
        if (e.html().length > 0) {
            e.show();
        } else {
            $.get(path, {}, function(text) {
                e.html(text.replace(/(?:\r\n|\r|\n)/g, '<br />'));
                e.show();
            });
        }
    } else {
        e.hide();
    }
}

function loadLibLists(container) {

    $.ajax({
         type:"GET",
         url:"libs.json",
         dataType:"json",
     }).success(function(json) {
        var tpl = $("#item_temp").html();

        html = "";
        for (i in json) {
            html += tpl.format(
            {
             title: json[i]["title"],
             libpath: json[i]["path"],
             descid: i,
             descpath: json[i]["path"]+'.txt',
            }
            );
        }
        $(container).html(html);
    });
}

function redirect() {
    if(navigator.userAgent.match(/(iPhone|iPod|Android|ios|Mobile|ARM)/i)){
        window.location.href = "m.html";
    } else {
        window.location.href = "pc.html";
    }
}

function goHome() {
    window.location.href = "index.html";
}

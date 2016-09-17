
var    ValueTypeU8 = 0;
var    ValueTypeU16 = 1;
var    ValueTypeU32 = 2;
var    ValueTypeString = 3;
var    ValueTypeBinary = 4;
var    ValueTypeObject = 5;

function baye_bridge_obj(obj) {
    var jsObj = {};
    var count = _object_get_field_count(obj);

    jsObj._bridged_obj = obj;

    for (var i = 0; i < count; i++) {
        var field = _object_get_field_by_index(obj, i);
        var cname = _object_get_field_name(field);
        var name = UTF8ToString(cname);
        var value = 0;

        switch (_object_get_field_type(field)) {
            case ValueTypeU8:
            case ValueTypeU16:
            case ValueTypeU32:
                value = _object_get_field_value(field);
                break;
            case ValueTypeString:
                value = _object_get_field_value(field);
                value = UTF8ToString(value);
                break;
            case ValueTypeBinary:
                value = _object_get_field_value(field);
                var size = _object_get_field_size(field);
                var data = [];
                for (var n = 0; n < size; n++) {
                    data[n] = getValue(value + n, 'i8');
                }
                value = data;
                break;
            case ValueTypeObject:
                value = _object_get_field_value(field);
                value = baye_bridge_obj(value);
                break;
        }
        jsObj[name] = value;
    }
    return jsObj;
}


function baye_sync_obj(obj, jsObj) {
    var count = _object_get_field_count(obj);

    for (var i = 0; i < count; i++) {
        var field = _object_get_field_by_index(obj, i);
        var cname = _object_get_field_name(field);
        var name = UTF8ToString(cname);
        var value = jsObj[name];

        switch (_object_get_field_type(field)) {
            case ValueTypeU8:
            case ValueTypeU16:
            case ValueTypeU32:
                _object_set_field_value(field, value, 0);
                break;
            case ValueTypeString:
                // TODO:
                break;
            case ValueTypeBinary:
                var mem = _object_get_field_value(field);
                var size = _object_get_field_size(field);
                for (var n = 0; n < Math.min(size, value.length); n++) {
                    setValue(mem + n, value[n], 'i8');
                }
                break;
            case ValueTypeObject:
                var cvalue = _object_get_field_value(field);
                baye_sync_obj(cvalue, value);
                break;
        }
        jsObj[name] = value;
    }
}

// 调试攻击范围
function debugPrintAttackRange(data) {
    var linesize = 15;
    var text = "";
    for (var i = 0; i < linesize; i++) {
        for (var j = 0; j < linesize; j++) {
            text += data[i*linesize + j] ? "*" : ".";
        }
        text += "\n";
    }
    console.log(text);
}


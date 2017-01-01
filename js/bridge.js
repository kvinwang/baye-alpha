
var    ValueTypeU8 = 0;
var    ValueTypeU16 = 1;
var    ValueTypeU32 = 2;
var    ValueTypeString = 3;
var    ValueTypeObject = 4;
var    ValueTypeArray = 5;
var    ValueTypeMethod = 6;

function baye_bridge_value(value) {
    return baye_bridge_valuedef(_Value_get_def(value), _Value_get_addr(value));
}

function baye_bridge_description_for_value(jvalue, type) {
    switch (type) {
        case ValueTypeU8:
        case ValueTypeU16:
        case ValueTypeU32:
        case ValueTypeString:
            return {
                get: function() {
                    return jvalue.value;
                },
                set: function(value) {
                    jvalue.value = value;
                }
            };
            break;
        case ValueTypeArray:
            return {
                get: function() {
                    return jvalue;
                },
                set: function(value) {
                    for(var i = 0; i < jvalue.length && i < value.length; i++) {
                        jvalue[i] = value[i]
                    }
                }
            };
            break;
        case ValueTypeObject:
            return {
                get: function() {
                    return jvalue;
                }
            }
            break;
    }
}

function baye_bridge_valuedef(def, addr) {
    var jsObj = {
        _def: def,
        _addr: addr,
        length: 10,
    };
    var type = _ValueDef_get_type(def);

    switch (type) {
        case ValueTypeU8:
            Object.defineProperty(jsObj, 'value', {
                get: function() {
                    return _baye_get_u8_value(this._addr);
                },
                set: function(value) {
                    return _baye_set_u8_value(this._addr, value);
                }
            });
            break;
        case ValueTypeU16:
            Object.defineProperty(jsObj, 'value', {
                get: function() {
                    return _baye_get_u16_value(this._addr);
                },
                set: function(value) {
                    return _baye_set_u16_value(this._addr, value);
                }
            });
            break;
        case ValueTypeU32:
            Object.defineProperty(jsObj, 'value', {
                get: function() {
                    return _baye_get_u32_value(this._addr);
                },
                set: function(value) {
                    return _baye_set_u32_value(this._addr, value);
                }
            });
            break;
        case ValueTypeString:
            Object.defineProperty(jsObj, 'value', {
                get: function() {
                    // TODO:
                    return this._addr;
                }
            });
            break;
        case ValueTypeObject:
            return baye_bridge_obj(def, addr);
        case ValueTypeArray:
            var length = _ValueDef_get_array_length(def);
            jsObj.length = length;
            var subdef = _ValueDef_get_array_subdef(def);
            var subsize = _ValueDef_get_size(subdef);
            for (var i = 0; i < length; i++) {
                var item_value = baye_bridge_valuedef(subdef, addr + subsize * i);
                var desc = baye_bridge_description_for_value(item_value, _ValueDef_get_type(subdef));
                Object.defineProperty(jsObj, i, desc);
            }
            break;
        case ValueTypeMethod:
            return function() {
            };
    }
    return jsObj;
}

function baye_bridge_obj(def, addr) {
    var jsObj = {};
    var count = _ValueDef_get_field_count(def);


    jsObj._def = def;
    jsObj._addr = addr;

    for (var i = 0; i < count; i++) {
        var field = _ValueDef_get_field_by_index(def, i);
        var cname = _Field_get_name(field);
        var name = UTF8ToString(cname);
        var field_value_addr = _Field_get_value(field);
        var value_def = _Value_get_def(field_value_addr);
        var value_offset = _Value_get_addr(field_value_addr);
        var field_value = baye_bridge_valuedef(value_def, addr + value_offset);

        var desc = baye_bridge_description_for_value(field_value, _Field_get_type(field));
        Object.defineProperty(jsObj, name, desc);
    }
    return jsObj;
}

function bayeU8Array(caddr, length) {
    return Module.HEAPU8.subarray(caddr, caddr+length);
}

function bayeWrapFunctionS(innerf) {
    return function() {
        var addr = innerf.apply(this, arguments);
        if (addr != 0) {
            return new TextDecoder('GBK').decode(bayeU8Array(addr, _bayeStrLen(addr)));
        }
        return null;
    };
}

$(function(){
    if (window.baye === undefined) {
        window.baye = {};
    }

    baye.getPersonName = bayeWrapFunctionS(_bayeGetPersonName);
    baye.getToolName = bayeWrapFunctionS(_bayeGetToolName);
    baye.getSkillName = bayeWrapFunctionS(_bayeGetSkillName);
    baye.getCityName = bayeWrapFunctionS(_bayeGetCityName);

    baye.getCustomData = function() {
        var cstr = _bayeGetCustomData();
        if (cstr == 0) return null;
        return UTF8ToString(cstr);
    }

    baye.setCustomData = function(data) {
        var length = lengthBytesUTF8(data) + 1;
        var buffer = Module._malloc(length);
        stringToUTF8(data, buffer, length);
        _bayeSetCustomData(buffer);
        Module._free(buffer);
    }

    baye.printPeople = function () {
        for (var i = 0; i < 250; i++) {
            var p = baye.data.g_Persons[i];
            if (p.Level > 0) {
                console.log('index:' + i + ' name:' + baye.getPersonName(i) + ' 归属:' + p.Belong);
            }
        }
    };

    baye.alert = function(msg, then){
    };

    baye.say = function(personIndex, msg, then){
    };

});


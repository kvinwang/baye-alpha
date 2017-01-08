
var    ValueTypeU8 = 0;
var    ValueTypeU16 = 1;
var    ValueTypeU32 = 2;
var    ValueTypeString = 3;
var    ValueTypeObject = 4;
var    ValueTypeArray = 5;
var    ValueTypeMethod = 6;
var    ValueTypeGBKBuffer = 7;

var gbkDecoder = new TextDecoder('GBK');
var gbkEncoder = new TextEncoder('GBK', { NONSTANDARD_allowLegacyEncoding: true });

function BayeObject() {
}

BayeObject.prototype.toString = function() {
    switch (this._type) {
    case ValueTypeU8:
        return 'U8(' + this.value + ')';
    case ValueTypeU16:
        return 'U16(' + this.value + ')';
    case ValueTypeU32:
        return 'U32(' + this.value + ')';
    case ValueTypeString:
        return 'String("' + this.value + '")';
    case ValueTypeObject:
        return 'Object';
    case ValueTypeArray:
        return 'Array[' + this.length + ']';
    case ValueTypeGBKBuffer:
        return 'GBKBuffer[' + this.length + ']';
    case ValueTypeMethod:
        return 'Method';
    }
};

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
                    return jvalue.value.value;
                },
                set: function(value) {
                    jvalue.value.value = value;
                }
            };
            break;
        case ValueTypeArray:
            return {
                get: function() {
                    return jvalue.value;
                },
                set: function(value) {
                    var jv = jvalue.value;
                    var length = jv.length;
                    for(var i = 0; i < length && i < value.length; i++) {
                        jv[i] = value[i]
                    }
                }
            };
            break;
        case ValueTypeGBKBuffer:
            return {
                get: function() {
                    return gbkDecoder.decode(jvalue.value);
                },
                set: function(value) {
                    var jv = jvalue.value;
                    var arr = gbkEncoder.encode(value);
                    var length = Math.min(jv.length - 1, arr.length);
                    for(var i = 0; i < length; i++) {
                        jv[i] = arr[i]
                    }
                    jv[length] = 0;
                }
            };
            break;
        case ValueTypeObject:
            return {
                get: function() {
                    return jvalue.value;
                }
            }
            break;
    }
}

function defineProperty(obj, p, desc) {
    Object.defineProperty(obj, p, desc);
}

function defineProperties(obj, desc) {
    Object.defineProperties(obj, desc);
}

function baye_bridge_valuedef_lazy(def, addr) {
    var obj = {
        get value() {
            if (this._value == undefined) {
                this._value = baye_bridge_valuedef(def, addr);
            }
            return this._value;
        }
    };
    return obj;
}

function baye_bridge_valuedef(def, addr) {
    var type = _ValueDef_get_type(def);
    var jsObj = new BayeObject();
    jsObj._def = def;
    jsObj._addr = addr;
    jsObj._type = type;

    switch (type) {
        case ValueTypeU8:
            defineProperty(jsObj, 'value', {
                get: function() {
                    return _baye_get_u8_value(this._addr);
                },
                set: function(value) {
                    return _baye_set_u8_value(this._addr, value);
                }
            });
            break;
        case ValueTypeU16:
            defineProperty(jsObj, 'value', {
                get: function() {
                    return _baye_get_u16_value(this._addr);
                },
                set: function(value) {
                    return _baye_set_u16_value(this._addr, value);
                }
            });
            break;
        case ValueTypeU32:
            defineProperty(jsObj, 'value', {
                get: function() {
                    return _baye_get_u32_value(this._addr);
                },
                set: function(value) {
                    return _baye_set_u32_value(this._addr, value);
                }
            });
            break;
        case ValueTypeString:
            defineProperty(jsObj, 'value', {
                get: function() {
                    // TODO:
                    return this._addr;
                }
            });
            break;
        case ValueTypeObject:
            return baye_bridge_obj(def, addr);
        case ValueTypeArray:
        case ValueTypeGBKBuffer:
            var length = _ValueDef_get_array_length(def);
            jsObj.length = length;
            var subdef = _ValueDef_get_array_subdef(def);
            var subsize = _ValueDef_get_size(subdef);
            var properties = {};
            for (var i = 0; i < length; i++) {
                var item_value = baye_bridge_valuedef_lazy(subdef, addr + subsize * i);
                var desc = baye_bridge_description_for_value(item_value, _ValueDef_get_type(subdef));
                properties[i] = desc;
            }
            defineProperties(jsObj, properties);
            break;
        case ValueTypeMethod:
            return function() {
            };
    }
    return jsObj;
}

function baye_bridge_obj(def, addr) {
    var jsObj = {};
    var properties = {};

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
        var field_value = baye_bridge_valuedef_lazy(value_def, addr + value_offset);

        var desc = baye_bridge_description_for_value(field_value, _Field_get_type(field));
        properties[name] = desc;
    }
    defineProperties(jsObj, properties);
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
    baye.debug = {};

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



    baye.getPersonByName = function(name) {
        var all = baye.data.g_Persons;
        for (var i = 0; i < all.length; i++) {
            if (baye.getPersonName(i) == name) {
                return all[i];
            }
        }
    };

    baye.getCityByName = function(name) {
        var all = baye.data.g_Cities;
        for (var i = 0; i < all.length; i++) {
            if (baye.getCityName(i) == name) {
                return all[i];
            }
        }
    };

    baye.getFighterIndexByName = function(name) {
        var all = baye.data.g_FgtParam.GenArray;
        for (var i = 0; i < all.length; i++) {
            var index = all[i] - 1;
            if (index >= 0 && baye.getPersonName(index) == name) {
                return i;
            }
        }
    };

    baye.getFighterPositionByName = function(name) {
        var idx = baye.getFighterIndexByName(name);
        return baye.data.g_GenPos[idx];
    };
});


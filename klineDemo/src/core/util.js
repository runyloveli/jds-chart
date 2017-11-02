/**
 * Created by JDR on 2017/9/6.
 * 辅助处理方法
 */

var nativeForEach = Array.prototype.forEach;
var nativeSlice = Array.prototype.slice;
var objToString = Object.prototype.toString;
var arrayProto = Array.prototype;
var nativeFilter = arrayProto.filter;
var nativeMap = arrayProto.map;
var nativeReduce = arrayProto.reduce;
var primitiveKey = '__ec_primitive__';
var BUILTIN_OBJECT = {
    '[object Function]': 1,
    '[object RegExp]': 1,
    '[object Date]': 1,
    '[object Error]': 1,
    '[object CanvasGradient]': 1,
    '[object CanvasPattern]': 1,
    // For node-canvas
    '[object Image]': 1,
    '[object Canvas]': 1
};

var TYPED_ARRAY = {
    '[object Int8Array]': 1,
    '[object Uint8Array]': 1,
    '[object Uint8ClampedArray]': 1,
    '[object Int16Array]': 1,
    '[object Uint16Array]': 1,
    '[object Int32Array]': 1,
    '[object Uint32Array]': 1,
    '[object Float32Array]': 1,
    '[object Float64Array]': 1
};

//数组或对象遍历
function each(obj, cb, dev) {
    if(! (obj && cb)) {
        return;
    }
    if(obj.forEach && obj.forEach === nativeForEach) {
        obj.forEach(cb, dev);
    } else if (obj.length === +obj.length) {//shuzu
        for(var i = 0, len = obj.length;i < len; i++){
            cb.call(dev, obj[i], i, obj);
        }
    } else {//duixiang
        for(var key in obj) {
            if(obj.hasOwnProperty(key)) {
                cb.call(dev, obj[key], key, obj);
            }
        }
    }
}
function merge(target, source, overwrite) {
    if (!isObject(source) || !isObject(target)) {
        return overwrite ? clone(source) : target;
    }
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            var targetProp = target[key];
            var sourceProp = source[key];
            if (isObject(sourceProp)
                && isObject(targetProp)
                && !isArray(sourceProp)
                && !isArray(targetProp)
                && !isDom(sourceProp)
                && !isDom(targetProp)
                && !isBuiltInObject(sourceProp)
                && !isBuiltInObject(targetProp)
                && !isPrimitive(sourceProp)
                && !isPrimitive(targetProp)
            ) {
                merge(targetProp, sourceProp, overwrite);
            }
            else if (overwrite || !(key in target)) {
                // 否则只处理overwrite为true，或者在目标对象中没有此属性的情况
                // NOTE，在 target[key] 不存在的时候也是直接覆盖
                target[key] = clone(source[key], true);
            }
        }
        if(key == 'series'){
            targetProp = target[key];
            sourceProp = source[key];
            if(Object.prototype.toString.call(sourceProp) == '[object Array]'){
                for(var i = 0;i < sourceProp.length; i++){
                    merge(targetProp[i],sourceProp[i]);
                }
            }
        }
    }

    return target;
}
function clone(source) {
    if (source == null || typeof source != 'object') {
        return source;
    }
    var result = source;
    var typeStr = objToString.call(source);
    if (typeStr === '[object Array]') {
        result = [];
        for (var i = 0, len = source.length; i < len; i++) {
            result[i] = clone(source[i]);
        }
    }
    else if (TYPED_ARRAY[typeStr]) {
        result = source.constructor.from(source);
    }
    else if (!BUILTIN_OBJECT[typeStr] && !isPrimitive(source) && !isDom(source)) {
        result = {};
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                result[key] = clone(source[key]);
            }
        }
    }

    return result;
}
//currying
function curry(fnc) {
    var args = nativeSlice.call(arguments, 1);
    return function() {
        return func.apply(this, args.concat(nativeSlice.call(arguments)));
    };
}
//inherit
function inherits(clazz, baseClazz) {
    var clazzPrototype = clazz.prototype;
    function F() {}
    F.prototype = baseClazz.prototype;
    clazz.prototype = new F();

    for (var prop in clazzPrototype) {
        clazz.prototype[prop] = clazzPrototype[prop];
    }
    clazz.prototype.constructor = clazz;
    clazz.superClass = baseClazz;
}
//绑定环境
function bind(func, context){
    var args = nativeSlice.call(arguments, 2);
    return function() {
        return func.apply(context, args.concat(nativeSlice.call(arguments)));
    }
}
//映射
function map(obj, cb, context) {
    if (!(obj && cb)) {
        return;
    }
    if (obj.map && obj.map === nativeMap) {
        return obj.map(cb, context);
    }
    else {
        var result = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            result.push(cb.call(context, obj[i], i, obj));
        }
        return result;
    }
}
//混合
function mixin(target, source, overlay) {
    target = 'prototype' in target ? target.prototype : target;
    source = 'prototype' in source ? source.prototype : source;
    for(var key in source){
        if(source.hasOwnProperty(key) && (overlay ? source[key] !== null : target[key] == null)){
            target[key] = source[key];
        }
    }
    return target;
}
function addEvtLis(el, Type, cb, useCapture) {
    if (el.addEventListener) {
        el.addEventListener(Type, cb, useCapture);
        return true;
    } else if (el.attachEvent) {
        var r = el.attachEvent('on' + Type, cb);
        return r;
    } else {
        el['on' + Type] = cb;
    }
    if (el.eventList === undefined) {
        el.eventList = [];
    }
}
function isObject(value) {
    var type = typeof value;
    return type === 'function' || (!!value && type == 'object');
}
function isArray(value) {
    return objToString.call(value) === '[object Array]';
}
function isBuiltInObject(value) {
    return !!BUILTIN_OBJECT[objToString.call(value)];
}
function isDom(value) {
    return typeof value === 'object'
        && typeof value.nodeType === 'number'
        && typeof value.ownerDocument === 'object';
}
function isPrimitive(obj) {
    return obj[primitiveKey];
}
var util = {
    inherits: inherits,
    each: each,
    map: map,
    bind: bind,
    merge: merge,
    isArray: isArray,
    mixin: mixin,
    addEvtLis: addEvtLis
};
module.exports = util;
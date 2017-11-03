(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["jdschart"] = factory();
	else
		root["jdschart"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/8/24.
	 */
	module.exports = __webpack_require__(1);
	__webpack_require__(23);
	//require('./src/chart/line');
	//require('./src/component/grid');

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var jdschart = {
	    version: '2.0.0',
	    dependencies: {
	        none: '0.0.0'
	    }
	};
	var idBase = new Date() - 0;
	var config = __webpack_require__(2);
	var Scale = __webpack_require__(3);
	var Storage = __webpack_require__(5);
	var util = __webpack_require__(4);
	var Handler = __webpack_require__(9);
	var HandlerProxy = __webpack_require__(12);
	var Painter = __webpack_require__(14);
	var defaultOption = __webpack_require__(16);
	var CoordinateSystemManager = __webpack_require__(17);
	var instances = {};
	var DOM_ATTRIBUTE_KEY = '_jindashi_instance';
	jdschart.preInit =  function() {
	    this.showLoading();
	};
	jdschart.init = function(dom) {
	    //this.showLoading();
	    window.ceshi = 0;
	    if (!dom) {
	        throw new Error('invalid dom');
	    }
	    if (!dom.clientWidth || !dom.clientHeight) {
	        console.warn('Can\'t get dom width or height');
	    }
	    var singleCanvas = !dom.nodeName || dom.nodeName.toUpperCase() === 'CANVAS';
	    var canvas = document.createElement("canvas");
	    canvas.style = 'position: absolute;';
	    //canvas.style.zIndex = opts.zlevel;
	    //canvas.style.border = "solid 1px #ced4db";
	    canvas.id = "canvas_" + idBase++;
	    //var box = document.getElementById(id);
	    dom.appendChild(canvas);
	    //var canvasWidth = document.getElementById("canvas").width =  document.body.offsetWidth - 5;
	    this.width = document.getElementById(canvas.id).width =  dom.clientWidth*config.devicePixelRatio;
	    //var canvasHeight =document.getElementById("canvas").height = (document.body.offsetWidth - 5) * 0.8;
	    this.height = document.getElementById(canvas.id).height = dom.clientHeight*config.devicePixelRatio;
	    //console.log("this", this);
	    var chart = new Jdscharts(dom);
	    chart.canvasId = canvas.id;
	    chart.id = 'jds_' + canvas.id;
	    instances[chart.id] = chart;
	    dom.setAttribute && dom.setAttribute(DOM_ATTRIBUTE_KEY, chart.id);
	    document.getElementById(canvas.id).style.width = dom.clientWidth + "px";
	    document.getElementById(canvas.id).style.height = dom.clientHeight + "px";
	    chart.proxy = new HandlerProxy(document.getElementById(canvas.id));
	    return chart;
	};
	jdschart.getInstanceByDom = function(dom) {
	    var key = dom.getAttribute(DOM_ATTRIBUTE_KEY);
	    return instances[key];
	};
	function Jdscharts(dom) {
	    this._dom = dom;
	    //this._dadom = document.getElementById('chart');
	    //this._coordSys = new CoordinateSystemManager();
	    this._needsRefresh = false;
	}
	function formatDate(timestamp) {
	    var now = new Date(timestamp);
	    var month = now.getMonth() + 1;
	    var date = now.getDate();
	    var hour = now.getHours();
	    var minute = now.getMinutes();

	    if (minute < 10) {
	        minute = '0' + minute;
	    }
	    return month + "-" + date + " " + hour + ":" + minute;
	}
	//jdschart不保留画图的方法
	Jdscharts.prototype = {
	    setCanvas: function(options) {
	        var newOptions = this.options = this.parseOption(defaultOption, options);
	        var ctx = this.ctx = document.getElementById(this.canvasId).getContext('2d');
	        var storage = new Storage();
	        var painter = new Painter(this._dom, storage, newOptions, ctx);
	        this.storage = storage;
	        this.painter = painter;
	        //if(!this.handler) {
	        //
	        //}
	        //var handleProxy = new HandlerProxy(document.getElementById(this.canvasId));
	        this.handler = new Handler(storage, newOptions, this.proxy, this._dom);
	        var oldDelFromStorage = storage.delFromStorage;
	        var oldAddToStorage = storage.addToStorage;
	        storage.delFromStorage = function (el) {
	            oldDelFromStorage.call(storage, el);
	            el && el.removeSelfFromZr(self);
	        };
	        storage.addToStorage = function (el) {
	            oldAddToStorage.call(storage, el);
	            //el.addSelfToZr(self);
	        };
	        //var coordSys = this._coordSys;
	        //coordSys.create();
	        var elGrid = {id:2313};
	        var elxAxis = {id:2};
	        var elyAxis = {id:3};
	        var elKline = {id:4};
	        var elLine = {id:5};
	        this.add(elGrid);//背景grid
	        this.add(elxAxis);//X轴
	        this.add(elyAxis);//Y轴
	        this.add(elKline);//K线
	        this.add(elLine);//折线
	        this.flush();
	        document.getElementById('JdsChart_Loading').style.display = 'none';
	        //coordSys.update();
	    },
	    parseOption: function(defopts,rawopts) {
	        rawopts = rawopts || {};
	        return util.merge(rawopts,defopts);
	    },
	    startImmediately: function() {
	        this.painter();
	        this._needstart = false;
	    },
	    add: function(el) {
	        this.storage.addRoot(el);
	        this._needsRefresh = true;
	    },
	    refresh: function () {
	        this._needsRefresh = true;
	    },
	    refreshImmediately: function () {
	        this._needsRefresh = false;
	        this.painter.refresh(window.JdsChart_Distance);
	        this._needsRefresh = false;
	    },
	    updateLastPoint: function(data) { //更新最新点
	        this.paint(data, this.dataRanges)
	    },
	    updateContract: function(data) { //更新合约
	        this.updateCounts = 0; //初始化翻屏页数
	        this.paint(data)
	    },
	    addNewData:function(data){
	        // this.isMove = false;
	        this.paint(data, null, true)
	    },
	    reSize:function(width){
	        this.options.region.width = width;
	        this.paint(this.data);
	    },
	    //getX: function(i) {
	    //    var result = (i + 0.5) * (this.options.spaceWidth + this.options.barWidth);
	    //    if (result * 10 % 10 == 0) result += .5;
	    //    return result;
	    //},
	    //getY: function(price) {
	    //    return ((this.high - price) * this.options.region.height / (this.high - this.low)) + this.options.region.y;
	    //},
	    //getA: function(i) {
	    //    var ser = this.options.series;
	    //    return i * (this.options.region.width / (ser[1].data.length - 1));
	    //},
	    //getB: function(i) { //获取价格点Y位置
	    //    return ((this.lhigh - i) * this.options.region.height / this.maxDiff)
	    //},
	    //getVolumeY: function(per) {
	    //    return ((this.highV - per) * this.options.volume.height / (this.highV - this.lowV)) + this.options.volume.y;
	    //}
	};
	Jdscharts.prototype.flush = function() {
	    if(this._needsRefresh) {
	        this.refreshImmediately();
	    }
	};
	Jdscharts.prototype.on = function(eventName, eventHandler, context) {
	    this.handler.on(eventName, eventHandler, context);
	};
	Jdscharts.prototype.off = function(eventName, eventHandler) {
	    this.handler.off(eventName, eventHandler);
	};
	Jdscharts.prototype.trigger = function(eventName, event){
	    this.handler.trigger(eventName, event);
	};
	jdschart.go = function(dom, options){

	    var myInstanceChart = jdschart.getInstanceByDom(dom);
	    var mychart = {};
	    if(myInstanceChart === undefined){
	        mychart = jdschart.init(dom);
	        mychart.setCanvas(options);
	    } else {
	        myInstanceChart.setCanvas(options);
	    }
	    myInstanceChart = jdschart.getInstanceByDom(dom);
	    var domId = dom.id;
	    window[domId] = myInstanceChart;
	};
	jdschart.dispose = function(dom) {
	    var key = dom.getAttribute(DOM_ATTRIBUTE_KEY);
	    delete instances[key];
	    if(dom.firstChild==null){
	        return;
	    }
	    var childid = dom.firstChild.id;
	    var childel = document.getElementById(childid);
	    childel.parentNode.removeChild(childel);
	};
	jdschart.showLoading =  function() {
	    if(document.getElementById('JdsChart_Loading')) {
	        document.getElementById('JdsChart_Loading').style.display = 'block';
	    } else {
	        var loadDiv = document.createElement('div');
	        var loadOne = document.createElement('div');
	        var loadTwo = document.createElement('div');
	        var loadThree = document.createElement('div');
	        loadDiv.id = 'JdsChart_Loading';
	        loadDiv.appendChild(loadOne);
	        loadDiv.appendChild(loadTwo);
	        loadDiv.appendChild(loadThree);
	        var loadBody = document.getElementsByTagName('body');
	        loadBody[0].insertBefore(loadDiv,loadBody[0].childNodes[0]);
	    }
	};
	jdschart.hideLoading =  function() {
	    document.getElementById('JdsChart_Loading').style.display = 'none';

	};
	module.exports = jdschart;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	/**
	 * Created by JDR on 2017/9/29.
	 */

	var dpr = 1;
	// If in browser environment
	if (typeof window !== 'undefined') {
	    dpr = Math.max(window.devicePixelRatio || 1, 1);
	}
	/**
	 * config默认配置项
	 * @exports zrender/config
	 * @author Kener (@Kener-林峰, kener.linfeng@gmail.com)
	 */
	var config = {
	    /**
	     * debug日志选项：catchBrushException为true下有效
	     * 0 : 不生成debug数据，发布用
	     * 1 : 异常抛出，调试用
	     * 2 : 控制台输出，调试用
	     */
	    debugMode: 0,

	    // retina 屏幕优化
	    devicePixelRatio: dpr
	};
	module.exports = config;




/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/9/11.
	 */
	var util = __webpack_require__(4);
	//if(typeof Array.prototype['max'] === 'undefined') {
	//    Array.prototype.max = function() {
	//        var max = this[0];
	//        var len = this.length;
	//        for (var i = 1; i < len; i++){
	//            if (this[i] > max) {
	//                max = this[i];
	//            }
	//        }
	//        return max;
	//    };
	//}
	//Array.prototype.min = function() {
	//    var min = this[0];
	//    var len = this.length;
	//    for (var i = 1; i < len; i++){
	//        if (this[i] < min){
	//            min = this[i];
	//        }
	//    }
	//    return min;
	//}
	function getMaximin(arr,maximin)
	{
	    if(maximin=="max")
	    {
	        return Math.max.apply(Math,arr);
	    }
	    else if(maximin=="min")
	    {
	        return Math.min.apply(Math, arr);
	    }
	}
	function Scale (data) {
	    this.data = data;
	}
	Scale.prototype = {
	    constructor: Scale,
	    candleMax: function() {
	        var data = this.data;
	        var allMax =  [];
	        util.each(data,function(value) {
	            allMax.push(value[3]);// pick all maximum
	        });
	        return getMaximin(allMax,"max");
	    },
	    candleMin: function() {
	        var data = this.data;
	        var allMax =  [];
	        util.each(data,function(value) {
	            allMax.push(value[2]);// pick all minimum
	        });
	        return getMaximin(allMax,"min");
	    },
	    barMax: function() {
	        var data = this.data;
	        var allMax =  [];
	        util.each(data,function(value) {
	            allMax.push(value);// pick all maximum
	        });
	        return getMaximin(allMax,"max");
	    },
	    barMin: function() {
	        var data = this.data;
	        var allMax =  [];
	        util.each(data,function(value) {
	            allMax.push(value);// pick all minimum
	        });
	        return getMaximin(allMax,"min");
	    }
	};
	module.exports = Scale;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

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

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/9/8.
	 */
	var util = __webpack_require__(4);
	var Group = __webpack_require__(6);
	var timsort = __webpack_require__(7);
	var env = __webpack_require__(8);
	function shapeCompareFunc(a, b) {
	    if (a.zlevel === b.zlevel) {
	        if (a.z === b.z) {
	            return a.z2 - b.z2;
	        }
	        return a.z - b.z;
	    }
	    return a.zlevel - b.zlevel;
	}
	var Storage = function () {
	    this._element = {};
	    this._roots = [];
	    this._displayList = [];
	    this._displayListLen = 0;
	};

	Storage.prototype = {
	    constructor: Storage,
	    getDisplayList: function(update, Ignore){
	        Ignore = Ignore || false;
	        if(update) {
	            this.updateDisplayList(Ignore);
	        }
	        return this._displayList;
	    },
	    updateDisplayList: function(includeIgnore){
	        this._displayListLen = 0;
	        var roots = this._roots;
	        var displayList = this._displayList;
	        for(var i = 0, len = roots.length; i < len; i++){
	            this._updateAndAddDisplayable(roots[i], null, includeIgnore);
	        }
	        displayList.length = this._displayListLen;
	        env.canvasSupported && timsort(displayList, shapeCompareFunc);
	    },
	    _updateAndAddDisplayable: function(el, clipPaths, includeIgnore){
	        if(el.ignore && !includeIgnore) {
	            return;
	        }

	        var userSetClipPath = el.clipPath;
	        if (userSetClipPath) {

	            // FIXME 效率影响
	            if (clipPaths) {
	                clipPaths = clipPaths.slice();
	            }
	            else {
	                clipPaths = [];
	            }

	            var currentClipPath = userSetClipPath;
	            var parentClipPath = el;
	            // Recursively add clip path
	            while (currentClipPath) {
	                // clipPath 的变换是基于使用这个 clipPath 的元素
	                currentClipPath.parent = parentClipPath;
	                currentClipPath.updateTransform();

	                clipPaths.push(currentClipPath);

	                parentClipPath = currentClipPath;
	                currentClipPath = currentClipPath.clipPath;
	            }
	        }
	        el.__clipPaths = clipPaths;

	        this._displayList[this._displayListLen++] = el;
	    },
	    addRoot: function (el) {
	        if (el.__storage === this) {
	            return;
	        }
	        if (el instanceof Group) {
	            el.addChildrenToStorage(this);
	        }
	        this.addToStorage(el);
	        this._roots.push(el);
	    },
	    delRoot: function(){
	        //清空
	        this._elements = {};
	        this._roots = [];
	        this._displayList = [];
	        this._displayListLen = 0;
	    },
	    addToStorage: function (el) {
	        el.__storage = this;
	        //el.dirty(false);
	        return this;
	    },

	    delFromStorage: function (el) {
	        if (el) {
	            el.__storage = null;
	        }

	        return this;
	    },
	    get: function (elId) {
	        return this._elements[elId];
	    }
	};
	module.exports = Storage;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/9/8.
	 */
	var zrUtil = __webpack_require__(4);
	var Group = function(opts) {
	    opts = opts || {};
	    this._children = {};
	    this._storage = null;
	    this._dirty = true;
	};
	Group.prototype = {
	    constructor: Group,
	    type: 'group',
	    silent: false,
	    children: function() {
	        return this._children.slice();
	    },
	    add: function (child) {
	        if (child && child !== this && child.parent !== this) {

	            this._children.push(child);

	            this._doAdd(child);
	        }

	        return this;
	    },
	    addBefore: function (child, nextSibling) {
	        if (child && child !== this && child.parent !== this
	            && nextSibling && nextSibling.parent === this) {

	            var children = this._children;
	            var idx = children.indexOf(nextSibling);

	            if (idx >= 0) {
	                children.splice(idx, 0, child);
	                this._doAdd(child);
	            }
	        }

	        return this;
	    },
	    remove: function (child) {
	        var zr = this.__zr;
	        var storage = this.__storage;
	        var children = this._children;

	        var idx = zrUtil.indexOf(children, child);
	        if (idx < 0) {
	            return this;
	        }
	        children.splice(idx, 1);

	        child.parent = null;

	        if (storage) {

	            storage.delFromMap(child.id);

	            if (child instanceof Group) {
	                child.delChildrenFromStorage(storage);
	            }
	        }

	        zr && zr.refresh();

	        return this;
	    }
	};
	zrUtil.inherits(Group, Element);
	module.exports = Group;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	/**
	 * Created by JDR on 2017/9/29.
	 */
	var DEFAULT_MIN_MERGE = 32;

	var DEFAULT_MIN_GALLOPING = 7;

	var DEFAULT_TMP_STORAGE_LENGTH = 256;

	function minRunLength(n) {
	    var r = 0;

	    while (n >= DEFAULT_MIN_MERGE) {
	        r |= n & 1;
	        n >>= 1;
	    }

	    return n + r;
	}

	function makeAscendingRun(array, lo, hi, compare) {
	    var runHi = lo + 1;

	    if (runHi === hi) {
	        return 1;
	    }

	    if (compare(array[runHi++], array[lo]) < 0) {
	        while (runHi < hi && compare(array[runHi], array[runHi - 1]) < 0) {
	            runHi++;
	        }

	        reverseRun(array, lo, runHi);
	    }
	    else {
	        while (runHi < hi && compare(array[runHi], array[runHi - 1]) >= 0) {
	            runHi++;
	        }
	    }

	    return runHi - lo;
	}

	function reverseRun(array, lo, hi) {
	    hi--;

	    while (lo < hi) {
	        var t = array[lo];
	        array[lo++] = array[hi];
	        array[hi--] = t;
	    }
	}

	function binaryInsertionSort(array, lo, hi, start, compare) {
	    if (start === lo) {
	        start++;
	    }

	    for (; start < hi; start++) {
	        var pivot = array[start];

	        var left = lo;
	        var right = start;
	        var mid;

	        while (left < right) {
	            mid = left + right >>> 1;

	            if (compare(pivot, array[mid]) < 0) {
	                right = mid;
	            }
	            else {
	                left = mid + 1;
	            }
	        }

	        var n = start - left;

	        switch (n) {
	            case 3:
	                array[left + 3] = array[left + 2];

	            case 2:
	                array[left + 2] = array[left + 1];

	            case 1:
	                array[left + 1] = array[left];
	                break;
	            default:
	                while (n > 0) {
	                    array[left + n] = array[left + n - 1];
	                    n--;
	                }
	        }

	        array[left] = pivot;
	    }
	}

	function gallopLeft(value, array, start, length, hint, compare) {
	    var lastOffset = 0;
	    var maxOffset = 0;
	    var offset = 1;

	    if (compare(value, array[start + hint]) > 0) {
	        maxOffset = length - hint;

	        while (offset < maxOffset && compare(value, array[start + hint + offset]) > 0) {
	            lastOffset = offset;
	            offset = (offset << 1) + 1;

	            if (offset <= 0) {
	                offset = maxOffset;
	            }
	        }

	        if (offset > maxOffset) {
	            offset = maxOffset;
	        }

	        lastOffset += hint;
	        offset += hint;
	    }
	    else {
	        maxOffset = hint + 1;
	        while (offset < maxOffset && compare(value, array[start + hint - offset]) <= 0) {
	            lastOffset = offset;
	            offset = (offset << 1) + 1;

	            if (offset <= 0) {
	                offset = maxOffset;
	            }
	        }
	        if (offset > maxOffset) {
	            offset = maxOffset;
	        }

	        var tmp = lastOffset;
	        lastOffset = hint - offset;
	        offset = hint - tmp;
	    }

	    lastOffset++;
	    while (lastOffset < offset) {
	        var m = lastOffset + (offset - lastOffset >>> 1);

	        if (compare(value, array[start + m]) > 0) {
	            lastOffset = m + 1;
	        }
	        else {
	            offset = m;
	        }
	    }
	    return offset;
	}

	function gallopRight(value, array, start, length, hint, compare) {
	    var lastOffset = 0;
	    var maxOffset = 0;
	    var offset = 1;

	    if (compare(value, array[start + hint]) < 0) {
	        maxOffset = hint + 1;

	        while (offset < maxOffset && compare(value, array[start + hint - offset]) < 0) {
	            lastOffset = offset;
	            offset = (offset << 1) + 1;

	            if (offset <= 0) {
	                offset = maxOffset;
	            }
	        }

	        if (offset > maxOffset) {
	            offset = maxOffset;
	        }

	        var tmp = lastOffset;
	        lastOffset = hint - offset;
	        offset = hint - tmp;
	    }
	    else {
	        maxOffset = length - hint;

	        while (offset < maxOffset && compare(value, array[start + hint + offset]) >= 0) {
	            lastOffset = offset;
	            offset = (offset << 1) + 1;

	            if (offset <= 0) {
	                offset = maxOffset;
	            }
	        }

	        if (offset > maxOffset) {
	            offset = maxOffset;
	        }

	        lastOffset += hint;
	        offset += hint;
	    }

	    lastOffset++;

	    while (lastOffset < offset) {
	        var m = lastOffset + (offset - lastOffset >>> 1);

	        if (compare(value, array[start + m]) < 0) {
	            offset = m;
	        }
	        else {
	            lastOffset = m + 1;
	        }
	    }

	    return offset;
	}

	function TimSort(array, compare) {
	    var minGallop = DEFAULT_MIN_GALLOPING;
	    var length = 0;
	    var tmpStorageLength = DEFAULT_TMP_STORAGE_LENGTH;
	    var stackLength = 0;
	    var runStart;
	    var runLength;
	    var stackSize = 0;

	    length = array.length;

	    if (length < 2 * DEFAULT_TMP_STORAGE_LENGTH) {
	        tmpStorageLength = length >>> 1;
	    }

	    var tmp = [];

	    stackLength = length < 120 ? 5 : length < 1542 ? 10 : length < 119151 ? 19 : 40;

	    runStart = [];
	    runLength = [];

	    function pushRun(_runStart, _runLength) {
	        runStart[stackSize] = _runStart;
	        runLength[stackSize] = _runLength;
	        stackSize += 1;
	    }

	    function mergeRuns() {
	        while (stackSize > 1) {
	            var n = stackSize - 2;

	            if (n >= 1 && runLength[n - 1] <= runLength[n] + runLength[n + 1] || n >= 2 && runLength[n - 2] <= runLength[n] + runLength[n - 1]) {
	                if (runLength[n - 1] < runLength[n + 1]) {
	                    n--;
	                }
	            }
	            else if (runLength[n] > runLength[n + 1]) {
	                break;
	            }
	            mergeAt(n);
	        }
	    }

	    function forceMergeRuns() {
	        while (stackSize > 1) {
	            var n = stackSize - 2;

	            if (n > 0 && runLength[n - 1] < runLength[n + 1]) {
	                n--;
	            }

	            mergeAt(n);
	        }
	    }

	    function mergeAt(i) {
	        var start1 = runStart[i];
	        var length1 = runLength[i];
	        var start2 = runStart[i + 1];
	        var length2 = runLength[i + 1];

	        runLength[i] = length1 + length2;

	        if (i === stackSize - 3) {
	            runStart[i + 1] = runStart[i + 2];
	            runLength[i + 1] = runLength[i + 2];
	        }

	        stackSize--;

	        var k = gallopRight(array[start2], array, start1, length1, 0, compare);
	        start1 += k;
	        length1 -= k;

	        if (length1 === 0) {
	            return;
	        }

	        length2 = gallopLeft(array[start1 + length1 - 1], array, start2, length2, length2 - 1, compare);

	        if (length2 === 0) {
	            return;
	        }

	        if (length1 <= length2) {
	            mergeLow(start1, length1, start2, length2);
	        }
	        else {
	            mergeHigh(start1, length1, start2, length2);
	        }
	    }

	    function mergeLow(start1, length1, start2, length2) {
	        var i = 0;

	        for (i = 0; i < length1; i++) {
	            tmp[i] = array[start1 + i];
	        }

	        var cursor1 = 0;
	        var cursor2 = start2;
	        var dest = start1;

	        array[dest++] = array[cursor2++];

	        if (--length2 === 0) {
	            for (i = 0; i < length1; i++) {
	                array[dest + i] = tmp[cursor1 + i];
	            }
	            return;
	        }

	        if (length1 === 1) {
	            for (i = 0; i < length2; i++) {
	                array[dest + i] = array[cursor2 + i];
	            }
	            array[dest + length2] = tmp[cursor1];
	            return;
	        }

	        var _minGallop = minGallop;
	        var count1, count2, exit;

	        while (1) {
	            count1 = 0;
	            count2 = 0;
	            exit = false;

	            do {
	                if (compare(array[cursor2], tmp[cursor1]) < 0) {
	                    array[dest++] = array[cursor2++];
	                    count2++;
	                    count1 = 0;

	                    if (--length2 === 0) {
	                        exit = true;
	                        break;
	                    }
	                }
	                else {
	                    array[dest++] = tmp[cursor1++];
	                    count1++;
	                    count2 = 0;
	                    if (--length1 === 1) {
	                        exit = true;
	                        break;
	                    }
	                }
	            } while ((count1 | count2) < _minGallop);

	            if (exit) {
	                break;
	            }

	            do {
	                count1 = gallopRight(array[cursor2], tmp, cursor1, length1, 0, compare);

	                if (count1 !== 0) {
	                    for (i = 0; i < count1; i++) {
	                        array[dest + i] = tmp[cursor1 + i];
	                    }

	                    dest += count1;
	                    cursor1 += count1;
	                    length1 -= count1;
	                    if (length1 <= 1) {
	                        exit = true;
	                        break;
	                    }
	                }

	                array[dest++] = array[cursor2++];

	                if (--length2 === 0) {
	                    exit = true;
	                    break;
	                }

	                count2 = gallopLeft(tmp[cursor1], array, cursor2, length2, 0, compare);

	                if (count2 !== 0) {
	                    for (i = 0; i < count2; i++) {
	                        array[dest + i] = array[cursor2 + i];
	                    }

	                    dest += count2;
	                    cursor2 += count2;
	                    length2 -= count2;

	                    if (length2 === 0) {
	                        exit = true;
	                        break;
	                    }
	                }
	                array[dest++] = tmp[cursor1++];

	                if (--length1 === 1) {
	                    exit = true;
	                    break;
	                }

	                _minGallop--;
	            } while (count1 >= DEFAULT_MIN_GALLOPING || count2 >= DEFAULT_MIN_GALLOPING);

	            if (exit) {
	                break;
	            }

	            if (_minGallop < 0) {
	                _minGallop = 0;
	            }

	            _minGallop += 2;
	        }

	        minGallop = _minGallop;

	        minGallop < 1 && (minGallop = 1);

	        if (length1 === 1) {
	            for (i = 0; i < length2; i++) {
	                array[dest + i] = array[cursor2 + i];
	            }
	            array[dest + length2] = tmp[cursor1];
	        }
	        else if (length1 === 0) {
	            throw new Error();
	            // throw new Error('mergeLow preconditions were not respected');
	        }
	        else {
	            for (i = 0; i < length1; i++) {
	                array[dest + i] = tmp[cursor1 + i];
	            }
	        }
	    }

	    function mergeHigh (start1, length1, start2, length2) {
	        var i = 0;

	        for (i = 0; i < length2; i++) {
	            tmp[i] = array[start2 + i];
	        }

	        var cursor1 = start1 + length1 - 1;
	        var cursor2 = length2 - 1;
	        var dest = start2 + length2 - 1;
	        var customCursor = 0;
	        var customDest = 0;

	        array[dest--] = array[cursor1--];

	        if (--length1 === 0) {
	            customCursor = dest - (length2 - 1);

	            for (i = 0; i < length2; i++) {
	                array[customCursor + i] = tmp[i];
	            }

	            return;
	        }

	        if (length2 === 1) {
	            dest -= length1;
	            cursor1 -= length1;
	            customDest = dest + 1;
	            customCursor = cursor1 + 1;

	            for (i = length1 - 1; i >= 0; i--) {
	                array[customDest + i] = array[customCursor + i];
	            }

	            array[dest] = tmp[cursor2];
	            return;
	        }

	        var _minGallop = minGallop;

	        while (true) {
	            var count1 = 0;
	            var count2 = 0;
	            var exit = false;

	            do {
	                if (compare(tmp[cursor2], array[cursor1]) < 0) {
	                    array[dest--] = array[cursor1--];
	                    count1++;
	                    count2 = 0;
	                    if (--length1 === 0) {
	                        exit = true;
	                        break;
	                    }
	                }
	                else {
	                    array[dest--] = tmp[cursor2--];
	                    count2++;
	                    count1 = 0;
	                    if (--length2 === 1) {
	                        exit = true;
	                        break;
	                    }
	                }
	            } while ((count1 | count2) < _minGallop);

	            if (exit) {
	                break;
	            }

	            do {
	                count1 = length1 - gallopRight(tmp[cursor2], array, start1, length1, length1 - 1, compare);

	                if (count1 !== 0) {
	                    dest -= count1;
	                    cursor1 -= count1;
	                    length1 -= count1;
	                    customDest = dest + 1;
	                    customCursor = cursor1 + 1;

	                    for (i = count1 - 1; i >= 0; i--) {
	                        array[customDest + i] = array[customCursor + i];
	                    }

	                    if (length1 === 0) {
	                        exit = true;
	                        break;
	                    }
	                }

	                array[dest--] = tmp[cursor2--];

	                if (--length2 === 1) {
	                    exit = true;
	                    break;
	                }

	                count2 = length2 - gallopLeft(array[cursor1], tmp, 0, length2, length2 - 1, compare);

	                if (count2 !== 0) {
	                    dest -= count2;
	                    cursor2 -= count2;
	                    length2 -= count2;
	                    customDest = dest + 1;
	                    customCursor = cursor2 + 1;

	                    for (i = 0; i < count2; i++) {
	                        array[customDest + i] = tmp[customCursor + i];
	                    }

	                    if (length2 <= 1) {
	                        exit = true;
	                        break;
	                    }
	                }

	                array[dest--] = array[cursor1--];

	                if (--length1 === 0) {
	                    exit = true;
	                    break;
	                }

	                _minGallop--;
	            } while (count1 >= DEFAULT_MIN_GALLOPING || count2 >= DEFAULT_MIN_GALLOPING);

	            if (exit) {
	                break;
	            }

	            if (_minGallop < 0) {
	                _minGallop = 0;
	            }

	            _minGallop += 2;
	        }

	        minGallop = _minGallop;

	        if (minGallop < 1) {
	            minGallop = 1;
	        }

	        if (length2 === 1) {
	            dest -= length1;
	            cursor1 -= length1;
	            customDest = dest + 1;
	            customCursor = cursor1 + 1;

	            for (i = length1 - 1; i >= 0; i--) {
	                array[customDest + i] = array[customCursor + i];
	            }

	            array[dest] = tmp[cursor2];
	        }
	        else if (length2 === 0) {
	            throw new Error();
	            // throw new Error('mergeHigh preconditions were not respected');
	        }
	        else {
	            customCursor = dest - (length2 - 1);
	            for (i = 0; i < length2; i++) {
	                array[customCursor + i] = tmp[i];
	            }
	        }
	    }

	    this.mergeRuns = mergeRuns;
	    this.forceMergeRuns = forceMergeRuns;
	    this.pushRun = pushRun;
	}

	function sort(array, compare, lo, hi) {
	    if (!lo) {
	        lo = 0;
	    }
	    if (!hi) {
	        hi = array.length;
	    }

	    var remaining = hi - lo;

	    if (remaining < 2) {
	        return;
	    }

	    var runLength = 0;

	    if (remaining < DEFAULT_MIN_MERGE) {
	        runLength = makeAscendingRun(array, lo, hi, compare);
	        binaryInsertionSort(array, lo, hi, lo + runLength, compare);
	        return;
	    }

	    var ts = new TimSort(array, compare);

	    var minRun = minRunLength(remaining);

	    do {
	        runLength = makeAscendingRun(array, lo, hi, compare);
	        if (runLength < minRun) {
	            var force = remaining;
	            if (force > minRun) {
	                force = minRun;
	            }

	            binaryInsertionSort(array, lo, lo + force, lo + runLength, compare);
	            runLength = force;
	        }

	        ts.pushRun(lo, runLength);
	        ts.mergeRuns();

	        remaining -= runLength;
	        lo += runLength;
	    } while (remaining !== 0);

	    ts.forceMergeRuns();
	}

	module.exports = sort;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	/**
	 * Created by JDR on 2017/9/28.
	 */
	/**
	 * 设备环境识别
	 */
	var env = {};
	if (typeof navigator === 'undefined') {
	    env = {
	        browser: {},
	        os: {},
	        node: true,
	        // Assume canvas is supported
	        canvasSupported: true
	    };
	}
	else {
	    env = detect(navigator.userAgent);
	}
	module.exports = env;
	function detect(ua) {
	    var os = {};
	    var browser = {};
	    // var webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/);
	    // var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
	    // var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
	    // var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
	    // var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
	    // var webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/);
	    // var touchpad = webos && ua.match(/TouchPad/);
	    // var kindle = ua.match(/Kindle\/([\d.]+)/);
	    // var silk = ua.match(/Silk\/([\d._]+)/);
	    // var blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/);
	    // var bb10 = ua.match(/(BB10).*Version\/([\d.]+)/);
	    // var rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/);
	    // var playbook = ua.match(/PlayBook/);
	    // var chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/);
	    var firefox = ua.match(/Firefox\/([\d.]+)/);
	    // var safari = webkit && ua.match(/Mobile\//) && !chrome;
	    // var webview = ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/) && !chrome;
	    var ie = ua.match(/MSIE\s([\d.]+)/)
	            // IE 11 Trident/7.0; rv:11.0
	        || ua.match(/Trident\/.+?rv:(([\d.]+))/);
	    var edge = ua.match(/Edge\/([\d.]+)/); // IE 12 and 12+
	    var weChat = (/micromessenger/i).test(ua);
	    // Todo: clean this up with a better OS/browser seperation:
	    // - discern (more) between multiple browsers on android
	    // - decide if kindle fire in silk mode is android or not
	    // - Firefox on Android doesn't specify the Android version
	    // - possibly devide in os, device and browser hashes
	    // if (browser.webkit = !!webkit) browser.version = webkit[1];
	    // if (android) os.android = true, os.version = android[2];
	    // if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.');
	    // if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.');
	    // if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
	    // if (webos) os.webos = true, os.version = webos[2];
	    // if (touchpad) os.touchpad = true;
	    // if (blackberry) os.blackberry = true, os.version = blackberry[2];
	    // if (bb10) os.bb10 = true, os.version = bb10[2];
	    // if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2];
	    // if (playbook) browser.playbook = true;
	    // if (kindle) os.kindle = true, os.version = kindle[1];
	    // if (silk) browser.silk = true, browser.version = silk[1];
	    // if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true;
	    // if (chrome) browser.chrome = true, browser.version = chrome[1];
	    if (firefox) {
	        browser.firefox = true;
	        browser.version = firefox[1];
	    }
	    // if (safari && (ua.match(/Safari/) || !!os.ios)) browser.safari = true;
	    // if (webview) browser.webview = true;
	    if (ie) {
	        browser.ie = true;
	        browser.version = ie[1];
	    }
	    if (edge) {
	        browser.edge = true;
	        browser.version = edge[1];
	    }
	    if (weChat) {
	        browser.weChat = true;
	    }

	    // os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
	    //     (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)));
	    // os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos ||
	    //     (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
	    //     (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))));

	    return {
	        browser: browser,
	        os: os,
	        node: false,
	        canvasSupported : document.createElement('canvas').getContext ? true : false,
	        touchEventsSupported: 'ontouchstart' in window && !browser.ie && !browser.edge,
	        pointerEventsSupported: 'onpointerdown' in window
	        && (browser.edge || (browser.ie && browser.version >= 11))
	    };
	}


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/9/22.
	 */
	var Drag = __webpack_require__(10);
	var Event = __webpack_require__(11);
	var util = __webpack_require__(4);
	var config = __webpack_require__(2);
	var handleNames = [
	    'touchstart', 'touchend', 'touchmove'
	];
	function makeEventPacket(eveType, targetInfo, event) {
	    return {
	        type: eveType,
	        event: event,
	        // target can only be an element that is not silent.
	        target: targetInfo.target,
	        // topTarget can be a silent element.
	        topTarget: targetInfo.topTarget,
	        cancelBubble: false,
	        offsetX: event.zrX,
	        offsetY: event.zrY,
	        gestureEvent: event.gestureEvent,
	        pinchX: event.pinchX,
	        pinchY: event.pinchY,
	        pinchScale: event.pinchScale,
	        wheelDelta: event.zrDelta,
	        zrByTouch: event.zrByTouch
	    };
	}
	var Handler = function(storage, newOptions, proxy, painterRoot){
	    Event.call(this);
	    this.options = newOptions;
	    this.storage = storage;
	    this.painterRoot = painterRoot;
	    this.proxy = proxy;
	    if(!proxy.handler){
	        proxy.handler=this
	    }else{
	        for(var name in this){
	            proxy.handler[name]=this[name];
	        }
	    }
	    //proxy.handler = this;
	    this._hovered = {};
	    this.switcher = true;
	    if(!window.JdsChart_Distance) {
	        window.JdsChart_Distance = 0;//事件触发前已经拖动的距离
	    }
	    this.JdsChart_MoveNumber = 0;
	    this.JdsChart_LastTouchMoment = 0;
	    this.startX = 0;
	    Drag.call(this);
	    util.each(handleNames, function(name) {
	        proxy.on && proxy.on(name, this[name], this);
	    }, this);
	};
	var longPressEvent = null;
	var longPressStart = false;
	function longPress(_this){
	    longPressStart = true;
	    //添加一个主canvas
	    var cross_canvas = _this.painterRoot.firstChild.cloneNode();
	    cross_canvas.id = cross_canvas.id+"_cross";
	    var tmpCross = document.getElementById(cross_canvas.id);
	    //关联canvas
	    var cross_canvas_correlation = document.getElementById(_this.options.correlationDomId).firstChild.cloneNode();
	    cross_canvas_correlation.id = cross_canvas_correlation.id+"_cross";
	    var tmpCross_correlation = document.getElementById(cross_canvas_correlation.id);
	    var type = _this.options.type;
	    if(tmpCross==null&&tmpCross_correlation==null){
	        _this.painterRoot.appendChild(cross_canvas);
	        document.getElementById(_this.options.correlationDomId).appendChild(cross_canvas_correlation);
	        cross_canvas.addEventListener('touchmove',function(e){
	            if(type=="candlestick"){
	                cross(e,cross_canvas);
	                crossVolume(e,cross_canvas_correlation);
	            }else{
	                cross(e,cross_canvas_correlation);
	                crossVolume(e,cross_canvas);
	            }
	        });
	        cross_canvas.addEventListener('touchend',function(e){
	            //移除cross_canvas
	            cross_canvas.remove();
	            cross_canvas_correlation.remove();
	            clearTimeout(longPressEvent);
	            longPressStart = false;
	        });
	        cross_canvas_correlation.addEventListener('touchmove',function(e){
	            if(type=="candlestick"){
	                cross(e,cross_canvas_correlation);
	                crossVolume(e,cross_canvas);
	            }else{
	                cross(e,cross_canvas);
	                crossVolume(e,cross_canvas_correlation);
	            }
	        });
	        cross_canvas_correlation.addEventListener('touchend',function(e){
	            //移除cross_canvas
	            cross_canvas.remove();
	            cross_canvas_correlation.remove();
	            clearTimeout(longPressEvent)
	        });
	        if(type=="candlestick"){
	            cross(_this.event,cross_canvas);
	            crossVolume(_this.event,cross_canvas_correlation);
	        }else{
	            cross(_this.event,cross_canvas_correlation);
	            crossVolume(_this.event,cross_canvas);
	        }
	    }
	}
	function cross(e,cvs){
	    var tmpX = e.targetTouches[0].pageX;
	    var tmpY = e.targetTouches[0].pageY;
	    window.JdsChart_kline.painter.cross(cvs,tmpX,tmpY);
	}
	function crossVolume(e,cvs){
	    var tmpX = e.targetTouches[0].pageX;
	    var tmpY = e.targetTouches[0].pageY;
	    window.JdsChart_klineVolume.painter.cross(cvs,tmpX,tmpY);
	}

	Handler.prototype = {
	    constructor: Handler,
	    touchstart: function(event){
	        //添加长按事件
	        var self = this;
	        self.event = event;
	        longPressEvent = setTimeout(longPress,1000,self);

	        if(this.painterRoot !== document.getElementById('JdsChart_kline') && this.painterRoot !== document.getElementById('JdsChart_klineVolume')){
	            return;
	        }
	        this.startX = window.event.zrX;
	    },
	    touchend: function(event){
	        clearTimeout(longPressEvent);
	        if(longPressStart) {
	            return
	        }
	        if(this.painterRoot !== document.getElementById('JdsChart_kline') && this.painterRoot !== document.getElementById('JdsChart_klineVolume')){
	            return;
	        }
	        var dpr = config.devicePixelRatio;
	        var opts = this.options;
	        var JdsChart_Barcount = Math.floor(opts.size.width/(opts.barWidth + opts.spaceWidth));
	        var JdsChart_Kline = opts.series[1];
	        var JdsChart_GlobalNum = JdsChart_Kline.data.length;
	        if(JdsChart_Kline.data.length == undefined){
	            JdsChart_GlobalNum = JdsChart_Kline.data.barVolume.length;
	        }
	        var JdsChart_MaxDistance = (JdsChart_GlobalNum - JdsChart_Barcount)*(opts.barWidth + opts.spaceWidth)*dpr;
	        var x = event.zrX;
	        if((window.JdsChart_Distance + (x - this.startX)*2) <= 0){
	            window.JdsChart_Distance = 0;
	        } else if( (window.JdsChart_Distance + (x - this.startX)*2) < JdsChart_MaxDistance) {
	            window.JdsChart_Distance = window.JdsChart_Distance + (x - this.startX)*2;
	        } else if((window.JdsChart_Distance + (x - this.startX)*2) > JdsChart_MaxDistance){
	            window.JdsChart_Distance = JdsChart_MaxDistance;
	        }
	    },
	    touchmove: function(event){
	        clearTimeout(longPressEvent);
	        if(longPressStart) {
	            return
	        }
	        if(this.painterRoot !== document.getElementById('JdsChart_kline') && this.painterRoot !== document.getElementById('JdsChart_klineVolume')){
	            return;
	        }
	        var dpr = config.devicePixelRatio;
	        var x = event.zrX;
	        var y = event.zrY;
	        var lastHovered = this._hovered;
	        var hovered = this._hovered = this.findHover(x, y);
	        var hoveredTarget = hovered.target;
	        var lasthoveredTarget = lastHovered.target;
	        var proxy = this.proxy;
	        var nowdistance = window.JdsChart_Distance + (x - this.startX)*2;
	        if(nowdistance < 0){
	            return;
	        }
	        proxy.setCursor && proxy.setCursor(hoveredTarget ? hoveredTarget.cursor : 'default');
	        var opts = this.options;
	        var JdsChart_Barcount = opts.size.width/(opts.barWidth + opts.spaceWidth)*dpr;
	        //所有实例重绘
	        var move = Math.abs(x - this.JdsChart_LastTouchMoment);
	        if(move > this.options.barWidth){
	            if(window.JdsChart_kline){
	                window.JdsChart_kline.painter.refresh(nowdistance);
	            }
	            if(window.JdsChart_klineVolume){
	                window.JdsChart_klineVolume.painter.refresh(nowdistance);
	            }
	            if(x - this.startX > 0){
	                this.JdsChart_MoveNumber = this.JdsChart_MoveNumber + 1
	            } else {
	                this.JdsChart_MoveNumber = this.JdsChart_MoveNumber - 1
	            }
	            this.JdsChart_LastTouchMoment = x;
	        }
	        var JdsChart_Kline = opts.series[1];
	        var JdsChart_GlobalNum = JdsChart_Kline.data.length;
	        if(JdsChart_Kline.data.length == undefined){
	            JdsChart_GlobalNum = JdsChart_Kline.data.barVolume.length;
	        }
	        var JdsChart_MaxDistance = JdsChart_GlobalNum*(opts.barWidth + opts.spaceWidth)*dpr;
	        if(JdsChart_MaxDistance*0.75 < nowdistance) {
	            var dev = this;
	            if(opts.loadmoreData instanceof Function && this.switcher == true){
	                setTimeout(function(){
	                    dev.switcher = true;
	                }, 5000);
	                if(opts.loadmoreData instanceof Function){
	                    opts.loadmoreData();
	                }
	                this.switcher = false ;
	            }
	        }

	            console.log(window.JdsChart_Distance, nowdistance, JdsChart_MaxDistance);
	    },
	    click: function(){console.log("统一设置事件触发click");},
	    //mousedown: function(){console.log("统一设置事件触发mousedown");},
	    //mouseup: function(){console.log("统一设置事件触发mouseup");},
	    mousewheel: function(){console.log("统一设置事件触发mousewheel");},
	    resize: function (event) {
	        this._hovered = null;
	    },
	    dispose: function () {
	        this.proxy.dispose();
	    },
	    setCursorStyle: function (cursorStyle) {
	        var proxy = this.proxy;
	        proxy.setCursor && proxy.setCursor(cursorStyle);
	    },
	    dispatch: function (eventName, eventArgs) {
	        var handler = this[eventName];
	        handler && handler.call(this, eventArgs);
	    },
	    dispatchToElement: function(targetInfo, eventName, event){
	        targetInfo = targetInfo || {};
	        var eventHandler = 'on' + eventName;
	        var eventPacket = makeEventPacket(eventName, targetInfo, event);
	        var el = targetInfo.target;
	        while(el) {
	            el[eventHandler]
	            &&(eventPacket.cancelBubble = el[eventHandler].call(el, eventPacket));
	            el.trigger(eventName, eventPacket);
	            el = el.parent;
	            if(eventPacket.cancelBubble) {
	                break;
	            }
	            if(!eventPacket.cancelBubble) {
	                this.trigger(eventName, eventPacket);
	                // 分发事件到用户自定义层
	                // 用户有可能在全局 click 事件中 dispose，所以需要判断下 painter 是否存在
	                this.painter && this.painter.eachOtherLayer(function (layer) {
	                    if (typeof(layer[eventHandler]) == 'function') {
	                        layer[eventHandler].call(layer, eventPacket);
	                    }
	                    if (layer.trigger) {
	                        layer.trigger(eventName, eventPacket);
	                    }
	                });
	            }
	        }
	    },
	    findHover: function(x, y, exclude){
	        var list = this.storage.getDisplayList();
	        for (var i = list.length - 1; i >= 0 ; i--) {
	            if (!list[i].silent
	                && list[i] !== exclude
	                && !list[i].ignore
	                //&& isHover(list[i], x, y)
	            ) {
	                return list[i];
	            }
	        }
	    }
	};
	function isHover(displayable, x, y) {
	    if (displayable[displayable.rectHover ? 'rectContain' : 'contain'](x, y)) {
	        var el = displayable;
	        var isSilent;
	        while (el) {
	            if (el.clipPath && !el.clipPath.contain(x, y))  {
	                return false;
	            }
	            if (el.silent) {
	                isSilent = true;
	            }
	            el = el.parent;
	        }
	        return isSilent ? SILENT : true;
	    }

	    return false;
	}
	util.mixin(Handler, Drag);
	util.mixin(Handler, Event);
	module.exports = Handler;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	/**
	 * Created by JDR on 2017/9/26.
	 */
	function Drag() {
	    this.on('mousedown',this._dragStart,this);
	    this.on('mousemove',this._drag,this);
	    this.on('mouseup',this._dragEnd,this);
	    this.on('globalout',this._dragEnd,this);
	}
	Drag.prototype = {
	    constructor: Drag,
	    _dragStart: function(e) {
	        var draggingTarget = e.target;
	        if(draggingTarget && draggingTarget.draggable) {
	            this._draggingTarget = draggingTarget;
	            draggingTarget.dragging = true;
	            this._x = e.offsetX;
	            this._y = e.offsetY;
	            this.dispatchToElement(draggingTarget, 'dragstart', e.event);
	        }
	    },
	    _drag: function(e) {
	        var draggingTarget = this._draggingTarget;
	        if(draggingTarget) {
	            var x = e.offsetX;
	            var y = e.offsetY;
	            var dx = x - this._x;
	            var dy = y - this._y;
	            this._x = x;
	            this._y = y;
	            draggingTarget.drift(dx, dy, e);
	            this.dispatchToElement(draggingTarget, 'drag', e.event);
	            var dropTarget = this.findHover(x, y, draggingTarget);
	            var lastDropTarget = this._dropTarget;
	            this._dropTarget = dropTarget;
	            if(draggingTarget !== dropTarget){
	                if(lastDropTarget && dropTarget !== lastDropTarget){
	                    this.dispatchToElement(lastDropTarget, 'dragleave', e.event);
	                }
	                if(dropTarget && dropTarget !== lastDropTarget){
	                    this.dispatchToElement(dropTarget, 'dragenter', e.event);
	                }
	            }

	        }
	    },
	    _dragEnd: function(e) {
	        var draggingTarget = this._draggingTarget;
	        if(draggingTarget){
	            draggingTarget.dragging = false;
	        }
	        this.dispatchToElement(draggingTarget, 'dragend', e.event);
	        if(this._dropTarget) {
	            this.dispatchToElement(this._dropTarget, 'drop', e.event);
	        }
	        this._draggingTarget = null;
	        this._dropTarget = null;
	    }
	};
	module.exports = Drag;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	/**
	 * Created by JDR on 2017/9/25.
	 */
	var arraySlice = Array.prototype.slice;
	var Event = function () {
	    this._$handlers = {};
	};
	Event.prototype = {
	    constructor: Event,
	    one: function (event, handler, dev) {
	        var _h = this._$handlers;
	        if(!handler || !event) {
	            return this;
	        }
	        if(!_h[event]){
	            _h[event] = [];
	        }
	        for(var i = 0;i < _h[event].length; i++) {
	            if(_h[event][i].h === handler){
	                return this;
	            }
	        }
	        _h[event].push({
	            h: handler,
	            one: true,
	            ctx: dev || this
	        });
	        return this;
	    },
	    on: function(event, handler, dev){
	        var _h = this._$handlers;
	        if(!handler || !event) {
	            return this;
	        }
	        if(!_h[event]){
	            _h[event] = [];
	        }
	        for(var i = 0; i < _h[event].length; i++){
	            if(_h[event][i].h === handler){
	                return this;
	            }
	        }
	        _h[event].push({
	            h: handler,
	            one: false,
	            ctx: dev || this
	        });
	        return this;
	    },
	    isSilent: function(event){
	        var _h = this._$handlers;
	        return _h[event] && _h[event].length;
	    },
	    off: function (event, handler) {
	        var _h = this._$handlers;

	        if (!event) {
	            this._$handlers = {};
	            return this;
	        }

	        if (handler) {
	            if (_h[event]) {
	                var newList = [];
	                for (var i = 0, l = _h[event].length; i < l; i++) {
	                    if (_h[event][i]['h'] != handler) {
	                        newList.push(_h[event][i]);
	                    }
	                }
	                _h[event] = newList;
	            }

	            if (_h[event] && _h[event].length === 0) {
	                delete _h[event];
	            }
	        }
	        else {
	            delete _h[event];
	        }

	        return this;
	    },
	    trigger: function (type) {
	        if (this._$handlers[type]) {
	            var args = arguments;
	            var argLen = args.length;
	            if (argLen > 3) {
	                args = arrySlice.call(args, 1);
	            }
	            var _h = this._$handlers[type];
	            var len = _h.length;
	            for (var i = 0; i < len;) {
	                // Optimize advise from backbone
	                switch (argLen) {
	                    case 1:
	                        _h[i]['h'].call(_h[i]['ctx']);
	                        break;
	                    case 2:
	                        _h[i]['h'].call(_h[i]['ctx'], args[1]);
	                        break;
	                    case 3:
	                        _h[i]['h'].call(_h[i]['ctx'], args[1], args[2]);
	                        break;
	                    default:
	                        // have more than 2 given arguments
	                        _h[i]['h'].apply(_h[i]['ctx'], args);
	                        break;
	                }
	                if (_h[i]['one']) {
	                    _h.splice(i, 1);
	                    len--;
	                }
	                else {
	                    i++;
	                }
	            }
	        }

	        return this;
	    },
	    triggerWithContext: function (type) {
	        if (this._$handlers[type]) {
	            var args = arguments;
	            var argLen = args.length;
	            if (argLen > 4) {
	                args = arrySlice.call(args, 1, args.length - 1);
	            }
	            var ctx = args[args.length - 1];
	            var _h = this._$handlers[type];
	            var len = _h.length;
	            for (var i = 0; i < len;) {
	                // Optimize advise from backbone
	                switch (argLen) {
	                    case 1:
	                        _h[i]['h'].call(ctx);
	                        break;
	                    case 2:
	                        _h[i]['h'].call(ctx, args[1]);
	                        break;
	                    case 3:
	                        _h[i]['h'].call(ctx, args[1], args[2]);
	                        break;
	                    default:
	                        // have more than 2 given arguments
	                        _h[i]['h'].apply(ctx, args);
	                        break;
	                }
	                if (_h[i]['one']) {
	                    _h.splice(i, 1);
	                    len--;
	                }
	                else {
	                    i++;
	                }
	            }
	        }
	        return this;
	    }
	};
	module.exports = Event;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/9/28.
	 */
	var Event = __webpack_require__(11);
	var util = __webpack_require__(4);
	var env = __webpack_require__(8);
	var eventTool = __webpack_require__(13);
	var addEventListener = eventTool.addEventListener;
	var removeEventListener = eventTool.removeEventListener;
	var normalizeEvent = eventTool.normalizeEvent;

	var TOUCH_CLICK_DELAY = 300;
	//定义鼠标事件类型
	var mouseHandlerNames = [
	    'click', 'mousewheel'
	    //'click', 'mousewheel', 'mouseout', 'mouseup', 'mousedown', 'mousemove'
	];
	//定义点击事件类型
	var touchHandlerNames = [
	    'touchstart', 'touchend', 'touchmove'
	];
	function eventNameFix(name) {
	    return (name === 'mousewheel' && env.browser.firefox) ? 'DOMMouseScroll' : name;
	}
	var domHandlers = {
	    touchstart: function(){
	        events = normalizeEvent(this.dom, event);
	        this.trigger('touchstart', events);
	    },
	    touchend: function(){
	        events = normalizeEvent(this.dom, event);
	        this.trigger('touchend', events);
	    },
	    touchmove: function(){
	        events = normalizeEvent(this.dom, event);
	        this.trigger('touchmove', events);
	    }
	};
	util.each(['click', 'mousewheel'], function(name) {
	    domHandlers[name] = function(event) {
	        event = normalizeEvent(this.dom, event);
	        this.trigger(name, event);
	    }
	});
	function initDomHandler(instance){
	    util.each(touchHandlerNames, function(name) {
	        instance._handlers[name] = util.bind(domHandlers[name], instance);
	    });
	    util.each(mouseHandlerNames, function (name) {
	        instance._handlers[name] = makeMouseHandler(domHandlers[name], instance);
	    });
	    function makeMouseHandler(fn, instance) {
	        return function() {
	            if(instance._touching) {
	                return;
	            }
	            return fn.apply(instance, arguments);
	        }
	    }
	}
	function HandlerDomProxy (dom){
	    Event.call(this);
	    this.dom = dom;
	    this._touching = false;
	    this._handlers = {};
	    initDomHandler(this);
	    //alert(env.touchEventsSupported);
	    if(env.touchEventsSupported){
	        mountHandlers(touchHandlerNames, this);
	    }
	    mountHandlers(mouseHandlerNames, this);
	    function mountHandlers(handlerNames, instance) {
	        util.each(handlerNames, function (name) {
	            addEventListener(dom, eventNameFix(name), instance._handlers[name]);
	        }, instance);
	    }
	}
	var handlerDomProxyProto = HandlerDomProxy.prototype;
	handlerDomProxyProto.dispose = function () {
	    var handlerNames = mouseHandlerNames.concat(touchHandlerNames);

	    for (var i = 0; i < handlerNames.length; i++) {
	        var name = handlerNames[i];
	        removeEventListener(this.dom, eventNameFix(name), this._handlers[name]);
	    }
	};

	handlerDomProxyProto.setCursor = function (cursorStyle) {
	    this.dom.style.cursor = cursorStyle || 'default';
	};
	util.mixin(HandlerDomProxy, Event);
	module.exports = HandlerDomProxy;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/9/28.
	 */
	'use strict';
	/**
	 * 事件辅助类
	 */
	var Eventful = __webpack_require__(11);
	var env = __webpack_require__(8);

	var isDomLevel2 = (typeof window !== 'undefined') && !!window.addEventListener;

	function getBoundingClientRect(el) {
	    // BlackBerry 5, iOS 3 (original iPhone) don't have getBoundingRect
	    return el.getBoundingClientRect ? el.getBoundingClientRect() : {left: 0, top: 0};
	}

	// `calculate` is optional, default false
	function clientToLocal(el, e, out, calculate) {
	    out = out || {};

	    // According to the W3C Working Draft, offsetX and offsetY should be relative
	    // to the padding edge of the target element. The only browser using this convention
	    // is IE. Webkit uses the border edge, Opera uses the content edge, and FireFox does
	    // not support the properties.
	    // (see http://www.jacklmoore.com/notes/mouse-position/)
	    // In zr painter.dom, padding edge equals to border edge.

	    // FIXME
	    // When mousemove event triggered on ec tooltip, target is not zr painter.dom, and
	    // offsetX/Y is relative to e.target, where the calculation of zrX/Y via offsetX/Y
	    // is too complex. So css-transfrom dont support in this case temporarily.
	    if (calculate || !env.canvasSupported) {
	        defaultGetZrXY(el, e, out);
	    }
	    // Caution: In FireFox, layerX/layerY Mouse position relative to the closest positioned
	    // ancestor element, so we should make sure el is positioned (e.g., not position:static).
	    // BTW1, Webkit don't return the same results as FF in non-simple cases (like add
	    // zoom-factor, overflow / opacity layers, transforms ...)
	    // BTW2, (ev.offsetY || ev.pageY - $(ev.target).offset().top) is not correct in preserve-3d.
	    // <https://bugs.jquery.com/ticket/8523#comment:14>
	    // BTW3, In ff, offsetX/offsetY is always 0.
	    else if (env.browser.firefox && e.layerX != null && e.layerX !== e.offsetX) {
	        out.zrX = e.layerX;
	        out.zrY = e.layerY;
	    }
	    // For IE6+, chrome, safari, opera. (When will ff support offsetX?)
	    else if (e.offsetX != null) {
	        out.zrX = e.offsetX;
	        out.zrY = e.offsetY;
	    }
	    // For some other device, e.g., IOS safari.
	    else {
	        defaultGetZrXY(el, e, out);
	    }

	    return out;
	}

	function defaultGetZrXY(el, e, out) {
	    // This well-known method below does not support css transform.
	    var box = getBoundingClientRect(el);
	    out.zrX = e.clientX - box.left;
	    out.zrY = e.clientY - box.top;
	}

	/**
	 * 如果存在第三方嵌入的一些dom触发的事件，或touch事件，需要转换一下事件坐标.
	 * `calculate` is optional, default false.
	 */
	function normalizeEvent(el, e, calculate) {

	    e = e || window.event;

	    if (e.zrX != null) {
	        return e;
	    }

	    var eventType = e.type;
	    var isTouch = eventType && eventType.indexOf('touch') >= 0;

	    if (!isTouch) {
	        clientToLocal(el, e, e, calculate);
	        e.zrDelta = (e.wheelDelta) ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
	    }
	    else {
	        var touch = eventType != 'touchend'
	            ? e.targetTouches[0]
	            : e.changedTouches[0];
	        touch && clientToLocal(el, touch, e, calculate);
	    }

	    return e;
	}

	function addEventListener(el, name, handler) {
	    if (isDomLevel2) {
	        el.addEventListener(name, handler);
	    }
	    else {
	        el.attachEvent('on' + name, handler);
	    }
	}

	function removeEventListener(el, name, handler) {
	    if (isDomLevel2) {
	        el.removeEventListener(name, handler);
	    }
	    else {
	        el.detachEvent('on' + name, handler);
	    }
	}

	/**
	 * preventDefault and stopPropagation.
	 * Notice: do not do that in zrender. Upper application
	 * do that if necessary.
	 *
	 * @memberOf module:zrender/core/event
	 * @method
	 * @param {Event} e : event对象
	 */
	var stop = isDomLevel2
	    ? function (e) {
	    e.preventDefault();
	    e.stopPropagation();
	    e.cancelBubble = true;
	}
	    : function (e) {
	    e.returnValue = false;
	    e.cancelBubble = true;
	};

	module.exports = {
	    clientToLocal: clientToLocal,
	    normalizeEvent: normalizeEvent,
	    addEventListener: addEventListener,
	    removeEventListener: removeEventListener,

	    stop: stop,
	    // 做向上兼容
	    Dispatcher: Eventful
	};



/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/9/29.
	 */
	var util = __webpack_require__(4);
	var config = __webpack_require__(2);
	var Sketch = __webpack_require__(15);
	var Scale = __webpack_require__(3);
	var Painter = function(root, storage, opts, ctx) {
	    this.options = opts;
	    this.dpr = opts.devicePixelRatio || config.devicePixelRatio;
	    this.root = root;
	    this.storage = storage;
	    this.ctx = ctx;
	};
	function calcAxisValues(high, low, count) {
	    var diff = high - low;
	    var space = diff / (count - 1);
	    var result = [];
	    for (var i = 0; i < count; i++) {
	        var value = (high - i * space) * 1.0;
	        if(value > 100){
	            value = value.toFixed(2);
	        } else if (value > 10000) {
	            value = (value / 10000).toFixed(2) + '万';
	        } else if (100 < value && value < 100000000) {
	            value = (value / 100000000).toFixed(2) + '亿';
	        } else if (value < 100) {
	            value = value*100;
	            value = value.toFixed(2) + '%';
	        }
	        result.push(value);
	    }
	    return result;
	}
	Painter.prototype = {
	    constructor: Painter,
	    crossKline_data:null,
	    crossVolume_data:null,
	    refresh: function(distance) {
	        var list = this.storage.getDisplayList(true);
	        this._paintList(list, distance);
	    },
	    cross: function(cvs,x,y){
	        //十字坐标
	        var ctx = cvs.getContext('2d');
	        if(this.options.type=="candlestick"){
	            var crossSketch = new Sketch(ctx,this.options);
	            crossSketch.clearCanvas();
	            for (var i = 0; i < this.crossKline_data.length; i++) {
	                var leftX = this.getX(i)-this.options.spaceWidth;
	                var rightX = this.getX(i) + this.options.barWidth;
	                if(x>=leftX&&x<rightX){
	                    var tmpY = this.getY(this.crossKline_data[i][1]);
	                    var tmpX = this.getX(i)-cvs.offsetLeft+this.options.barWidth*this.dpr/2;
	                    //横线
	                    crossSketch.paintLine(0,tmpY,this.options.region.width,0);
	                    //竖线
	                    crossSketch.paintLine(tmpX,0,0,this.options.region.height);
	                    //圆点
	                    var p = {x:tmpX, y:tmpY};
	                    crossSketch.paintCicle(p,2,"#000");
	                }
	            }
	        }else if(this.options.type=="bar"){
	            var crossSketch = new Sketch(ctx,this.options);
	            crossSketch.clearCanvas();
	            for (var i = 0; i < this.crossVolume_data.length; i++) {
	                var leftX = this.getX(i)-this.options.spaceWidth;
	                var rightX = this.getX(i) + this.options.barWidth;
	                console.log(this.getX(i))
	                if(x>=leftX&&x<rightX){
	                    var tmpY = this.getY(this.crossVolume_data[i][1]);
	                    var tmpX = this.getX(i)-cvs.offsetLeft+this.options.barWidth*this.dpr/2;
	                    
	                    //横线
	                    //crossSketch.paintLine(0,tmpY,this.options.region.width,0);
	                    //竖线
	                    crossSketch.paintLine(tmpX,0,0,this.options.region.height);
	                    //圆点
	                    // var p = {x:tmpX, y:tmpY};
	                    // crossSketch.paintCicle(p,2,"#000");
	                }
	            }
	        }
	    },
	    _paintList: function(list, distance){
	        var dpr = this.dpr;
	        distance = distance || 0 ;
	        var JdsChart_Movenum = 0;
	        var options = this.options;
	        var init = new Sketch(this.ctx, options);
	        this.ctx.clearRect(0, 0, options.size.width*dpr, (options.size.height+6)*dpr);
	        var series = options.series;
	        var chartNum = 1;
	        init.grid(options);
	        if(util.isArray(series)){
	            chartNum = series.length;
	        }
	        var categoryData = options.xAxis.data;
	        var JdsChart_Barcount = Math.floor(options.size.width/(options.barWidth + options.spaceWidth));
	        for(var a = 0;a < chartNum;a++){
	            if(series[a].type == 'candlestick'){
	                var kseries = series[a];
	            }
	        }
	        var filteredKlineData = [];
	        if(kseries){
	            var klineData = kseries.data;
	            var klineDataLength = kseries.data.length;
	            for (var i = 0; i < klineDataLength; i++) {
	                filteredKlineData.push(klineData[i]);
	            }
	            var allLength = filteredKlineData.length * (options.barWidth + options.spaceWidth)*dpr;
	            var nowLength = JdsChart_Barcount * (options.barWidth + options.spaceWidth)*dpr;
	            if(distance > allLength - nowLength){
	                distance = allLength - nowLength;
	            }
	            JdsChart_Movenum = Math.floor(distance/(options.barWidth + options.spaceWidth)/dpr);
	        }
	        var high, low, highV,lowV;
	        var dataFomatte = [];
	        var JdsChart_Difference = filteredKlineData.length - JdsChart_Barcount;
	        var JdsChart_NowData = filteredKlineData;
	        
	        if(JdsChart_Difference > 0){
	            if(filteredKlineData.length - JdsChart_Barcount - JdsChart_Movenum > 0) {
	                JdsChart_NowData = filteredKlineData.slice(filteredKlineData.length - JdsChart_Barcount - JdsChart_Movenum, filteredKlineData.length - JdsChart_Movenum);
	                categoryData = options.xAxis.data.slice(filteredKlineData.length - JdsChart_Barcount - JdsChart_Movenum, filteredKlineData.length - JdsChart_Movenum);
	            } else {
	                JdsChart_NowData = filteredKlineData.slice(0, JdsChart_Barcount);
	                categoryData = options.xAxis.data.slice(0, JdsChart_Barcount);
	            }
	        }
	        this.crossKline_data = JdsChart_NowData;
	        JdsChart_NowData.each(function(val, a, i) {
	            if(val[1] > val[0]) {
	                val.push(1, val[1], val[0]);
	            } else if (val[1] == val[0]) {
	                val.push(0, val[0], val[1]);
	            } else if (val[1] < val[0]) {
	                val.push(-1, val[0], val[1]);
	            }
	            dataFomatte.push(val);
	            if (i == 0) {
	                high = val[2];
	                low = val[3];
	                highV = val[6];
	                lowV = val[6];
	            } else {
	                high = Math.max(val[2], high);
	                low = Math.min(low, val[3]);
	                highV = Math.max(val[5], highV);
	                lowV = Math.min(lowV, val[5]);
	            }
	        });
	        var JdsChart_LineDifference = 0;
	        if(options.type == 'candlestick') {
	            var ranges = this.calculateCandleWidth(JdsChart_NowData) || {};
	            //filteredData 原数据（开，收，低，高）
	            //dataFomatter 格式化数据（开，收，低，高，类型，实体上边界线价位，实体下边界线价位）
	            var highest = ranges.maximum;
	            var lowest = ranges.minimum;
	            var ratiok = ranges.ratio;
	            this.high = highest;
	            this.low = lowest;
	            this.highV = highV;
	            this.lowV = lowV;
	            this.currentX = 0;
	            //根据移动距离测算当前窗口开始与结束之间最大最小值
	            var priceItems = calcAxisValues(highest, lowest, options.grid.rowNum);
	            init.createYAxis(options, priceItems);
	            init.createXAxis(options, categoryData);
	            //渲染K线
	            init.paintCandleLine(dataFomatte, this, ratiok, distance);
	            //渲染MA辅助线
	            var priceMA5 = this.calculateMA(5,series[1].data);
	            var priceMA10 = this.calculateMA(10,series[1].data);
	            var priceMA20 = this.calculateMA(20,series[1].data);
	            JdsChart_Movenum = Math.floor(distance/(options.barWidth + options.spaceWidth)/dpr);
	            JdsChart_LineDifference = series[1].data.length - JdsChart_Barcount;
	            priceMA5 = maCalcute(priceMA5, series[1].data.length);
	            priceMA10 = maCalcute(priceMA10, series[1].data.length);
	            priceMA20 = maCalcute(priceMA20, series[1].data.length);
	            if(priceMA5.length > 0){
	                init.drawMA(priceMA5, this, '#ff9700');
	                if(document.getElementById('MA5')){
	                    document.getElementById('MA5').innerHTML = priceMA5[priceMA5.length - 1];
	                }
	            }
	            if(priceMA10.length > 0){
	                init.drawMA(priceMA10, this, '#00b4ff');
	                if(document.getElementById('MA10')){
	                    document.getElementById('MA10').innerHTML = priceMA10[priceMA10.length - 1];
	                }
	            }
	            if(priceMA20.length > 0){
	                init.drawMA(priceMA20, this, '#d900ff');
	                if(document.getElementById('MA20')){
	                    document.getElementById('MA20').innerHTML = priceMA20[priceMA20.length - 1];
	                }
	            }
	        }
	        else if(options.type == 'bar'){
	            //遍历获取数据
	            for(var j = 0;j < chartNum;j++){
	                if(series[j].type == 'bar'){
	                    var barseries = series[j];
	                }
	            }
	            if(barseries){
	                var yuanBarData = barseries.data;
	                var barData = barseries.data.barVolume;
	                //var barDataLength = barseries.data.barVolume.length;
	                var barallLength = barData.length * (options.barWidth + options.spaceWidth)*dpr;
	                var barnowLength = JdsChart_Barcount * (options.barWidth + options.spaceWidth)*dpr;
	                if(distance > barallLength - barnowLength){
	                    distance = barallLength - barnowLength;
	                }
	                JdsChart_Movenum = Math.floor(distance/(options.barWidth + options.spaceWidth)/dpr);
	                var JdsChart_BarDifference = barData.length - JdsChart_Barcount;
	                var JdsChart_BarNowData = barData;
	                var JdsChart_KNow = {};
	                if(JdsChart_BarDifference > 0){
	                    if(barData.length - JdsChart_Barcount - JdsChart_Movenum > 0) {
	                        JdsChart_BarNowData = barData.slice(barData.length - JdsChart_Barcount - JdsChart_Movenum, barData.length - JdsChart_Movenum);
	                        JdsChart_KNow = yuanBarData.values.slice(yuanBarData.values.length - JdsChart_Barcount - JdsChart_Movenum, yuanBarData.values.length - JdsChart_Movenum);
	                    } else {
	                        JdsChart_BarNowData = barData.slice(0, JdsChart_Barcount);
	                        JdsChart_KNow = yuanBarData.values.slice(0, JdsChart_Barcount);
	                    }
	                }
	            }
	            this.crossVolume_data = JdsChart_BarNowData;
	            //计算柱状图y轴数值范围
	            var barRanges = this.calculateBarRanges(JdsChart_BarNowData) || {};
	            //柱状图最高最低赋值
	            var barHighest = this.barHighest = barRanges.maximum;
	            var barLowest = this.barLowest = barRanges.minimum;
	            var priceItemsBar = calcAxisValues(barHighest, barLowest, options.grid.rowNum);
	            init.createYAxis(options, priceItemsBar);
	            init.createXAxis(options, categoryData);
	            //渲染柱状图
	            var ratio = 1;
	            init.paintBar(JdsChart_KNow, JdsChart_BarNowData, this, ratio, distance);
	            this.high = barHighest;
	            this.low = barLowest;
	            var volumeMA5 = this.calcuteBarMA(5,series[1].data.barVolume);
	            var volumeMA10 = this.calcuteBarMA(10,series[1].data.barVolume);
	            var volumeMA20 = this.calcuteBarMA(20,series[1].data.barVolume);
	            JdsChart_Movenum = Math.floor(distance/(options.barWidth + options.spaceWidth)/dpr);
	            JdsChart_LineDifference = series[1].data.barVolume.length - JdsChart_Barcount;
	            volumeMA5 = maCalcute(volumeMA5, series[1].data.barVolume.length);
	            volumeMA10 = maCalcute(volumeMA10, series[1].data.barVolume.length);
	            volumeMA20 = maCalcute(volumeMA20, series[1].data.barVolume.length);
	            if(volumeMA5.length > 0){
	                init.drawMA(volumeMA5, this, '#ff9700');
	                if(document.getElementById('volMA5')){
	                    var value = volumeMA5[volumeMA5.length - 1];
	                    if(value > 10000){
	                        value = value * 1;
	                        value = (value / 10000).toFixed(2) + '万';
	                    } else if (value > 100000000) {
	                        value = value * 1;
	                        value = (value / 100000000).toFixed(2) + '亿';
	                    } else if (value < 10000) {
	                        value = value * 1;
	                        value = value.toFixed(2);
	                    }
	                    document.getElementById('volMA5').innerHTML = value;
	                }
	            }
	            if(volumeMA10.length > 0){
	                init.drawMA(volumeMA10, this, '#00b4ff');
	                if(document.getElementById('volMA10')){
	                    var value10 = volumeMA10[volumeMA10.length - 1];
	                    if(value10 > 10000){
	                        value10 = value10 * 1;
	                        value10 = (value10 / 10000).toFixed(2) + '万';
	                    } else if (value10 > 100000000) {
	                        value10 = value10 * 1;
	                        value10 = (value10 / 100000000).toFixed(2) + '亿';
	                    } else if (value10 < 10000) {
	                        value10 = value10 * 1;
	                        value10 = value10.toFixed(2);
	                    }
	                    document.getElementById('volMA10').innerHTML = value10;
	                }
	            }
	            if(volumeMA20.length > 0){
	                init.drawMA(volumeMA20, this, '#d900ff');
	                if(document.getElementById('volMA20')){
	                    var value20 = volumeMA20[volumeMA20.length - 1];
	                    if(value20 > 10000){
	                        value20 = value20 * 1;
	                        value20 = (value20 / 10000).toFixed(2) + '万';
	                    } else if (value20 > 100000000) {
	                        value20 = value20 * 1;
	                        value20 = (value20 / 100000000).toFixed(2) + '亿';
	                    } else if (value20 < 10000) {
	                        value20 = value20 * 1;
	                        value20 = value20.toFixed(2);
	                    }
	                    document.getElementById('volMA20').innerHTML = value20;
	                }
	            }
	        }
	        else if (options.type == 'volume') {
	            for(var v = 0;v < chartNum;v++){
	                if(series[v].type == 'bar'){
	                    var volumeseries = series[v];
	                }
	            }
	            if(volumeseries){
	                var volumeData = volumeseries.data.values;
	                var JdsChart_VNow = [];
	                for(var u = 0; u < volumeData.length; u++) {
	                    JdsChart_VNow.push(volumeData[u][1]);
	                }
	                var volumeRanges = this.calculateBarRanges(JdsChart_VNow) || {};
	                var volumeHighest = this.volumeHighest = volumeRanges.maximum;
	                var volumeLowest = this.volumeLowest = volumeRanges.minimum;
	                var priceItemsVolume = calcAxisValues(volumeHighest, volumeLowest, options.grid.rowNum);
	                init.createYAxis(options, priceItemsVolume);
	                init.paintBar(volumeData, JdsChart_VNow, this, 1, distance);
	            }
	        }
	        else if(options.type == 'line') {
	            var averageParse = [];
	            var lineDataParse = [];
	            var highLowParse = [];
	            for(var c = 0;c < chartNum;c++){
	                if(series[c].type == 'line'){
	                    var lineseries = series[c];
	                }
	            }
	            if(lineseries) {
	                var lineData = lineseries.data;
	            }
	            for(var e = 0; e < lineData.length; e++) {
	                averageParse.push(lineData[e][3].toFixed(2));
	                lineDataParse.push(lineData[e][0].toFixed(2));
	                highLowParse.push(lineData[e][6]);
	                if(e) {
	                    if(lineData[e][5] != lineData[e-1][5]) {
	                        window.JdsChart_seperate = e;
	                    }
	                }
	            }
	            var lineHighest = Math.max.apply(Math,lineDataParse);
	            var lineLowest = Math.min.apply(Math,lineDataParse);
	            var highLowHighest = Math.max.apply(Math,highLowParse);
	            var highLowLowest = Math.min.apply(Math,highLowParse);
	            var yesterdayEnd = this.options.yesterdayEnd;
	            var cha1 = lineHighest - yesterdayEnd;
	            var cha2 = yesterdayEnd - lineLowest;
	            if(cha1 > cha2){
	                lineLowest = yesterdayEnd - (lineHighest - yesterdayEnd);
	            } else {
	                lineHighest = yesterdayEnd + (yesterdayEnd - lineLowest);
	            }
	            var yesterPrice = 0;
	            var highlowcha1 = highLowHighest - yesterPrice;
	            var highlowcha2 = yesterPrice - highLowLowest;
	            if(highlowcha1 > highlowcha2){
	                highLowLowest = yesterPrice - (highLowHighest - yesterPrice);
	            } else {
	                highLowHighest = yesterPrice + (yesterPrice - highLowLowest);
	            }
	            var priceItemsLine = calcAxisValues(lineHighest, lineLowest, options.grid.rowNum);
	            var highLowLine = calcAxisValues(highLowHighest, highLowLowest, options.grid.rowNum);
	            this.lhigh = lineHighest;
	            this.maxDiff = lineHighest - lineLowest;
	            init.createYAxis(options, priceItemsLine, 'first');
	            init.createYAxis(options, highLowLine, 'second');
	            if(options.sub_type === 'min_line') {
	                init.createXAxis(options, ['20:00', '15:30']);
	            } else {
	                var date = new Date();
	                var nowYear = date.getFullYear();
	                var nowDay = date.getDate();
	                var nowMonth = date.getMonth() + 1;
	                var dater = nowYear + '/' + nowMonth + '/' + nowDay;
	                var nowdate = [];
	                nowdate.push(dater);
	                init.createXAxis(options, nowdate);
	            }

	            init.drawLine(lineDataParse, this);
	            init.drawAverage(averageParse, this, '#ff9700');
	        }
	        function maCalcute(source, length){
	            if(JdsChart_LineDifference > 0){
	                if(JdsChart_LineDifference - JdsChart_Movenum > 0) {
	                    source = source.slice(JdsChart_LineDifference - JdsChart_Movenum, length - JdsChart_Movenum);
	                } else {
	                    source = source.slice(0, JdsChart_Barcount);
	                }
	            }
	            return source;
	        }
	    },
	    _doPaintList: function(){},
	    _doPaintEl: function(){},
	    resize: function(){},
	    getV: function(i, JdsChart_Barnumber) {
	        var ser = this.options.series;
	        return i * (this.options.region.width / (JdsChart_Barnumber - 1));
	    },
	    getX: function(i) {
	        var result = (i + 0.5) * (this.options.spaceWidth + this.options.barWidth);
	        if (result * 10 % 10 == 0) result += .5;
	        return result;
	    },
	    getY: function(price) {
	        return ((this.high - price) * this.options.region.height / (this.high - this.low)) + this.options.region.y;
	    },
	    getA: function(i, JdsChart_NowNumber) {
	        var ser = this.options.series;
	        //return i * (this.options.region.width / (ser[0].data.length - 1));
	        return i * (this.options.region.width / (JdsChart_NowNumber - 1));
	    },
	    getB: function(i) { //获取价格点Y位置
	        return ((this.lhigh - i) * this.options.region.height / this.maxDiff)
	    },
	    getM: function(i, JdsChart_NowNumber) {
	        var ser = this.options.series;
	        //return i * (this.options.region.width / (ser[0].data.length - 1));
	        return i * (this.options.region.width / (JdsChart_NowNumber - 1));
	    },
	    getI: function(i) { //获取价格点Y位置
	        return ((this.lhigh - i) * this.options.region.height / this.maxDiff)
	    },
	    getBarY: function(value) {
	        return ((this.barHighest - value) * this.options.volume.height / (this.barHighest - this.barLowest));
	    },
	    getVolumeY: function(value) {
	        return ((this.volumeHighest - value) * this.options.volume.height / (this.volumeHighest - this.volumeLowest));
	    },
	    calculateCandleWidth: function (data) {
	        var scale = new Scale(data);
	        var maximum = scale.candleMax();
	        var minimum = scale.candleMin();
	        var range = maximum - minimum;
	        return {'maximum': maximum,'minimum': minimum,'range': range,'ratio': 0.8};
	    },
	    calculateBarRanges: function(data) {
	        var scale = new Scale(data);
	        var maximum = scale.barMax().toFixed();
	        var minimum = scale.barMin().toFixed();
	        var range = maximum - minimum;
	        return {'maximum': maximum,'minimum': minimum,'range': range,'ratio': 0.8};
	    },
	    calculateMA: function(dayCount, data) {
	        var result = [];
	        for (var i = 0, len = data.length; i < len; i++) {
	            if (i < dayCount) {
	                result.push('-');
	                continue;
	            }
	            var sum = 0;
	            for (var j = 0;  j < dayCount; j++) {
	                sum += data[i - j][1];
	            }
	            result.push((sum / dayCount).toFixed(2));
	        }
	        return result;
	    },
	    calcuteBarMA: function(dayCount, data){
	        var result = [];
	        for(var j = 0, ben = data.length; j < ben; j++) {
	            if(j < dayCount) {
	                result.push('-');
	                continue;
	            }
	            var sum = 0;
	            for(var z = 0; z < dayCount; z++) {
	                sum += data[j - z];
	            }
	            result.push((sum / dayCount).toFixed(2));
	        }
	        return result;
	    }
	};
	module.exports = Painter;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	var config = __webpack_require__(2);
	function Sketch(context, options) {
	    this.dpr = config.devicePixelRatio;
	    this.ctx = context;
	    this.options = options||{};
	}
	Sketch.prototype = {
	    constructor:Sketch,
	    clearCanvas:function(){
	        var ctx = this.ctx;
	        ctx.clearRect(0,0,this.options.region.width*this.dpr,this.options.region.height*this.dpr);
	    },
	    /*画直线（x坐标，y坐标，x轴移动距离，y轴移动距离）*/
	    paintLine: function(x, y, width, height) {
	        var dpr = this.dpr;
	        x = x * dpr;
	        y = y * dpr;
	        width = width * dpr;
	        height = height * dpr;
	        var ctx = this.ctx;
	        ctx.beginPath();
	        ctx.moveTo(x, y);
	        ctx.lineTo(x + width, y + height);
	        ctx.stroke();
	    },
	    paintText: function(text, x, y) {
	        var dpr = this.dpr;
	        x = x * dpr;
	        y = y * dpr;
	        this.ctx.font = '24px PingFangSC-Regular';
	        this.ctx.fillText(text, x, y);
	    },
	    grid: function(options) {
	        var ctx = this.ctx;
	        ctx.strokeStyle = options.grid.borderColor || "#000";
	        ctx.lineWidth = options.grid.borderWidth || "1px";
	        var spaceHeight = options.region.height / (options.grid.rowNum - 1);
	        var regionWidth = options.region.width;
	        var regionHeight = options.region.height;
	        var xMove = regionWidth - options.grid.left - options.grid.right;
	        var yMove = regionHeight - options.grid.top - options.grid.bottom;
	        for(var i = 0; i <= options.grid.rowNum; i++) {
	            var x = options.grid.left;
	            var y = options.grid.top + regionHeight * i / (options.grid.rowNum -1);
	            this.paintLine(x, y, xMove, 0);
	        }
	        for(var j = 0; j < options.grid.coloumNum + 1; j++) {
	            var a = (regionWidth-options.grid.left-options.grid.right)/(options.grid.coloumNum) * j;
	            var b = options.grid.top;
	            this.paintLine(a, b, 0, yMove);
	        }
	    },
	    paintVine: function(x, y, height) {
	        var ctx = this.ctx;
	        ctx.beginPath();
	        ctx.moveTo(x, y);
	        ctx.lineTo(x, y + height);
	        ctx.stroke();
	    },
	    createYAxis: function(options,priceItems,order) {
	        if(!options.yAxis.show){
	            return;
	        }
	        var ctx = this.ctx;
	        options.yAxis.region.x_two = options.yAxis.region.x_two || 0;
	        ctx.strokeStyle = options.Hline.color || "#000";
	        ctx.lineStyle = options.Hline.lineStyle || "solid";
	        ctx.lineWidth = options.Hline.lineWidth || "1px";
	        var spaceHeight = options.region.height / (options.grid.rowNum - 1);
	        ctx.fillStyle = options.yAxis.backgroundColor;
	        ctx.fillRect(0, 0, options.yAxis.backgroundWidth, options.yAxis.backgroundheight);
	        ctx.fillStyle = options.yAxis.color.secondColor;
	        ctx.font = options.yAxis.font;
	        var xCoord = 0;
	        if(order == 'first') {
	            xCoord = options.yAxis.region.x;
	        } else if (order == 'second') {
	            xCoord = options.yAxis.region.x_two;
	        }
	        for (var i = 0; i < options.grid.rowNum; i++) {
	            var y = options.region.y + spaceHeight * i;
	            var b = 0;
	            if(i){
	                b = 6;
	            }
	            if(i == options.grid.rowNum-1) {
	                b = 15;
	            }
	            if(priceItems[i].indexOf('-') >= 0) {
	                xCoord -= 1
	            }
	            if(options.grid.rowNum%2 == 0) {
	                if(i <= options.grid.rowNum/2) {
	                    ctx.fillStyle = options.yAxis.color.firstColor;
	                } else {
	                    ctx.fillStyle = options.yAxis.color.thirdColor;
	                }

	            } else {
	                if((i+0.5) < options.grid.rowNum/2) {
	                    ctx.fillStyle = options.yAxis.color.firstColor;
	                } else if((i+0.5) == options.grid.rowNum/2) {
	                    ctx.fillStyle = options.yAxis.color.secondColor;
	                } else if ((i+0.5) > options.grid.rowNum/2) {
	                    ctx.fillStyle = options.yAxis.color.thirdColor;
	                }
	            }
	            this.paintText(priceItems[i], xCoord, y + 12 - b);
	        }
	    },
	    createXAxis: function(options, data) {//X轴刻度
	        if(!options.xAxis.show){
	            return;
	        }
	        options = options.xAxis;

	        var num = options.splitNumber;
	        this.ctx.fillStyle = options.color;
	        this.ctx.font = options.font;
	        if(options.sub_type === 'minline') {
	            num = 2;
	        }
	        if(options.sub_type === 'two_line') {
	            num = 1;
	        }
	        var picking = pick(data, num);
	        var steps = options.region.width/(num-1) - 30;
	        for (var i = 0; i < picking.length; i++) {
	            if(picking.length == 1){
	                this.paintText(picking[i], options.region.width/2 - picking[i].length*3, options.region.y);
	            } else if (picking.length == 2) {
	                if(i == 0) {
	                    this.paintText(picking[i], 0, options.region.y);
	                } else {
	                    this.paintText(picking[i], options.region.width-picking[i].length*7, options.region.y);
	                }
	            } else if(picking.length >= 3) {
	                if(i == 0) {
	                    this.paintText(picking[i], options.region.x + steps * i - 5, options.region.y);
	                } else if(i === picking.length-1) {
	                    this.paintText(picking[i], options.region.x + steps * i - picking[i].length*1, options.region.y)
	                } else {
	                    this.paintText(picking[i], options.region.x + steps * i - 5, options.region.y)
	                }

	            }
	        }
	        function pick(source, num) {
	            var picked = [];
	            picked.push(source[0]);
	            if(source.length == 0) {
	                return '';
	            } else if (source.length == 1){
	                return picked;
	            } else if (source.length == 2) {
	                picked.push(source[1]);
	            } else if (source.length >= 3) {
	                for(var i = 0;i < num-2;i++){
	                    picked.push(source[Math.ceil(source.length/num*(i+1))]);
	                }
	                picked.push(source[source.length-1]);
	            }
	            return picked;
	        }
	    },
	    drawLine: function(priceArray, self) {
	        var type = self.options.type || '';
	        var sub_type = self.options.sub_type || '';
	        var JdsChart_NowNumber = 1320;
	        if(sub_type === 'min_line') {
	            JdsChart_NowNumber = 660;
	        }
	        this.maxDotsCount = priceArray.length;
	        var col = '';
	        for (var i = 0; i < this.maxDotsCount; i++) {
	            this.paintMAline(i, self.getA(i, JdsChart_NowNumber), self.getB(priceArray[i]) + this.options.region.y, col, type)
	        }
	    },
	    drawAverage: function(priceArray, self, col) {
	        var type = self.options.type || '';
	        var sub_type = self.options.sub_type || '';
	        var JdsChart_NowNumber = 1320;
	        if(sub_type === 'min_line') {
	            JdsChart_NowNumber = 660;
	        }
	        this.maxDotsCount = priceArray.length;
	        for (var i = 0; i < this.maxDotsCount; i++) {
	            this.paintMAline(i, self.getM(i, JdsChart_NowNumber), self.getI(priceArray[i]) + this.options.region.y, col, type)
	        }
	    },
	    drawMA: function(priceArray, self, color) {
	        this.maxDotsCount = priceArray.length;
	        for (var i = 0; i < this.maxDotsCount; i++) {
	            this.paintMAline(i, self.getX(i), self.getY(priceArray[i]) + this.options.region.y, color)
	        }
	        //for (var j = 0; j < this.maxDotsCount; j++) {
	        //    this.paintItemDiv(j, self.getX(j)+distance, self.getY(priceArray[j]) + this.options.region.y)
	        //}
	    },
	    paintMAline: function(i, x, y, col, type) {
	        type = type || '';
	        var ctx = this.ctx;
	        var dpr = this.dpr;
	        ctx.strokeStyle = col || '#333333';
	        ctx.lineWidth = 2;
	        x = x * dpr;
	        y = y * dpr;
	        if(type == 'line') {
	            if (i == 0) {
	                ctx.lineStyle = 'solid';
	                ctx.strokeStyle = 'rgba(12,22,22,1)';
	                ctx.beginPath();
	                ctx.moveTo(x, y);
	            } else if (i == this.maxDotsCount - 1) {
	                ctx.lineTo(x, y);
	                ctx.stroke();
	            } else if(i === window.JdsChart_seperate) {
	                ctx.moveTo(x, y);
	            } else {
	                ctx.lineTo(x, y);
	            }
	        } else {
	            if (i == 0) {
	                ctx.lineStyle = 'solid';
	                ctx.strokeStyle = 'rgba(12,22,22,1)';
	                ctx.beginPath();
	                ctx.moveTo(x, y);
	            } else if (i == this.maxDotsCount - 1) {
	                ctx.lineTo(x, y);
	                ctx.stroke();
	            } else {
	                ctx.lineTo(x, y);
	            }
	        }

	    },
	    paintItemDiv: function(i, x, y) { //价格走势图白色渐变区域
	        var ctx = this.ctx;
	        if (i == 0) {
	            ctx.beginPath();
	            ctx.moveTo(x, y);
	        } else if (i == this.maxDotsCount - 1) {
	            ctx.lineTo(x, y);
	            ctx.strokeStyle = 'rgba(255,255,255,0)';
	            var my_gradient = ctx.createLinearGradient(0, 0, 0, 170);
	            my_gradient.addColorStop(0, 'rgba(255,255,255,0.6)');
	            my_gradient.addColorStop(1, 'rgba(255,255,255,0.2)');
	            ctx.fillStyle = my_gradient;
	            ctx.lineTo(x, this.options.region.height + this.options.region.y);
	            ctx.lineTo(this.options.region.x, this.options.region.height + this.options.region.y);
	            ctx.closePath();
	            ctx.stroke();
	            ctx.fill();
	        } else {
	            ctx.lineTo(x, y);
	        }
	    },
	    paintCandleLine: function(items, dev, ratio, distance) {
	        this.currentX = 0;
	        for (var i = 0; i < items.length; i++) {
	            this.drawCandle(i, items[i], dev, ratio, distance);
	        }
	    },
	    paintBar: function(JdsChart_KNow, JdsChart_BarNowData, dev, ratio){
	        var barDatas = JdsChart_BarNowData;
	        var kDatas = JdsChart_KNow;
	        for(var z = 0; z < barDatas.length; z++){
	            this.drawVolume(z, barDatas[z], kDatas[z], dev, ratio);
	        }
	    },
	    paintVolumeBorder:function(){
	        this.ctx.lineWidth = "1px";
	        this.ctx.strokeStyle = "#efefef";
	        this.ctx.strokeRect(this.options.volume.x, this.options.volume.y, this.options.volume.width, this.options.volume.height);
	    },
	    drawVolume:function(i,value,ki,dev,ratio){
	        var dpr = this.dpr;
	        var style = this.options.series[1];
	        var color = style.itemStyle.riseColor;
	        var color0 = style.itemStyle.fallColor;
	        var lineX, topY, JdsChart_Barnumber=0;
	        if(dev.options.type == 'bar'){
	            lineX = dev.getX(i);//获取x轴坐标
	            topY = dev.getBarY(value);
	        } else if(dev.options.type == 'volume') {
	            if(dev.options.sub_type == 'min_line') {
	                JdsChart_Barnumber = 660;
	            } else {
	                JdsChart_Barnumber = 1320;
	            }
	            lineX = dev.getV(i, JdsChart_Barnumber);//获取x轴坐标
	            topY = dev.getVolumeY(value);
	        }
	        var topX = lineX - this.options.barWidth / 2;
	        this.ctx.beginPath();
	        this.ctx.lineWidth = 2;
	        if(dev.options.type == 'bar') {
	            if (ki[1] > ki[0]) { //红线
	                colors = color;
	                this.ctx.strokeStyle = colors;
	                this.ctx.strokeRect(topX*dpr, topY*dpr, this.options.barWidth*dpr, (dev.options.volume.y+dev.options.volume.height-topY)*dpr);
	            }
	            if (ki[1] < ki[0]) { //绿线
	                colors = color0;
	                this.ctx.fillStyle = colors;
	                this.ctx.fillRect(topX*dpr, topY*dpr, this.options.barWidth*dpr, (dev.options.volume.y+dev.options.volume.height-topY)*dpr);
	            }
	            if (ki[1] == ki[0]) { //白线
	                colors = '#000';
	                this.ctx.fillStyle = colors;
	                this.ctx.fillRect(topX*dpr, topY*dpr, this.options.barWidth*dpr, (dev.options.volume.y+dev.options.volume.height-topY)*dpr);
	            }
	        } else if (dev.options.type == 'volume') {
	            if (ki[4] == 1) { //红线
	                colors = color;
	                this.ctx.strokeStyle = colors;
	                this.ctx.strokeRect(topX*dpr, topY*dpr, this.options.barWidth*dpr, (dev.options.volume.y+dev.options.volume.height-topY)*dpr);
	            }
	            if (ki[4] == -1) { //绿线
	                colors = color0;
	                this.ctx.fillStyle = colors;
	                this.ctx.fillRect(topX*dpr, topY*dpr, this.options.barWidth*dpr, (dev.options.volume.y+dev.options.volume.height-topY)*dpr);
	            }
	            if (ki[4] == 0) { //白线
	                colors = '#000';
	                this.ctx.fillStyle = colors;
	                this.ctx.fillRect(topX*dpr, topY*dpr, this.options.barWidth*dpr, (dev.options.volume.y+dev.options.volume.height-topY)*dpr);
	            }
	        }


	    },
	    drawCandle: function(i, ki, dev, ratio, distance) {
	        var ratios = ratio || 1;
	        var dpr = this.dpr;
	        var color = dev.options.riseColor;
	        var lineX = dev.getX(i);
	        if (this.currentX == 0) this.currentX = lineX;
	        else {
	            if (lineX - this.currentX < 1) return;
	        }
	        this.currentX = lineX;
	        var topY = dev.getY(ki[3]);//上影线
	        var bottomY = dev.getY(ki[2]);//下影线
	        var candleX = lineX - dev.options.barWidth / 2; //实体开始X点
	        var candleY = dev.getY(ki[6]);//实体开始Y点
	        var candleBottomY = dev.getY(ki[7]);//实体结束Y点
	        var candleHeight = candleBottomY - candleY;//实体的高度
	        if (ki[5] > 0) { //红线
	            color = dev.options.riseColor;
	        }
	        if (ki[5] < 0) { //绿线
	            color = dev.options.fallColor;
	        }
	        if (ki[5] == 0) { //白线
	            candleHeight = 1;
	            fillcolor = '#949494';
	        }
	        this.ctx.strokeStyle = color;
	        this.ctx.fillStyle = color;
	        this.ctx.lineWidth = 2;
	        this.ctx.beginPath();
	        lineX = lineX * dpr;
	        topY = topY * dpr;
	        bottomY = bottomY * dpr;
	        candleX = candleX * dpr;
	        candleY = candleY * dpr;
	        candleBottomY = candleBottomY * dpr;
	        this.ctx.moveTo(lineX, topY);
	        this.ctx.lineTo(lineX, candleY);
	        this.ctx.moveTo(lineX, candleBottomY);
	        this.ctx.lineTo(lineX, bottomY);
	        if (ki[5] > 0) { //红线
	            this.ctx.strokeRect(candleX, candleY, dev.options.barWidth*dpr, candleHeight*dpr);
	        } else if (ki[5] <= 0){
	            this.ctx.fillRect(candleX, candleY, dev.options.barWidth*dpr, candleHeight*dpr);
	        }
	        this.ctx.stroke();
	    },
	    paintTips: function(position, text) {
	        this.paintVine(position.x, this.options.region.y, this.options.volume.y+this.options.volume.height-this.options.region.y)
	        this.paintTipContent(580, text);
	        this.paintPoint(position)
	    },
	    paintTipContent: function(width, text) {
	        var options = this.options;
	        this.ctx.fillStyle = "#efefef";
	        this.ctx.fillRect(options.region.width - width, 0, width, options.region.y)
	        this.ctx.fillStyle = "red";
	        this.ctx.fillText(text, options.region.width - width + 10, 20)
	    },
	    paintPoint:function(position){
	        this.paintCicle(position,8,"rgba(72,118,255,0.7)");
	        this.paintCicle(position,4,"white")
	        this.paintCicle(position,3,"rgba(72,118,255,1)")
	    },
	    paintCicle: function(position,r,color) {
	        var ctx = this.ctx;
	        //画一个实心圆
	        ctx.beginPath();
	        ctx.arc(position.x*this.dpr,position.y*this.dpr, r*this.dpr, 0, 360, false);
	        ctx.fillStyle = color;
	        ctx.fill(); //画实心圆
	        ctx.closePath();
	    }
	};
	module.exports = Sketch;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	/**
	 * Created by JDR on 2017/9/18.
	 */
	var defaultOption = {
	    //type:1折线图，2K线图，3折线+K线图，默认折线图
	    type: 1,
	    animation: false,
	    title: {
	        show: true,
	        text: '',
	        link: '',
	        Color: '#333',
	        Fontsize: '18px',
	        textAlign: 'center',
	        VerticalAlign: 'middle',
	        BorderColor: 'transparent',
	        Zlevel: 0,
	        z: 2
	    },
	    legend: {},
	    grid: {
	        show: true,
	        zlevel: 0,
	        z: 2,
	        rowNum: 5,
	        coloumNum: 4,
	        borderColor: "#ced4db",
	        borderWidth: 1,
	        backgroundColor: '#f22',
	        left: 0,
	        right: 0,
	        top: 0,
	        bottom:0
	    },
	    xAxis:{
	        show: false,
	        zlevel: 0,
	        z: 0,
	        font: '10px Helvetica',
	        color: '#2e3033',
	        width: 90,
	        region: {
	            x: 4.5,
	            y: 245,
	            width: 362
	        },
	        splitNumber: 3,
	        axisLine: {},
	        axisTick: {},
	        axisLabel: {
	            showMaxLabel: true,
	            textStyle: {
	                color: '#000',
	                fontSize: 24
	            },
	            formatter: function (value) {
	                return format(new Date(value), "MM/dd");
	            }
	        }
	    },
	    yAxis:{
	        show: false,
	        zlevel: 0,
	        z: 0,
	        axisLine: {},
	        axisTick: {},
	        axisLabel: {}
	    },
	    dataZoom: {},
	    toolTip: {},
	    axisPointer: {},
	    graphic: {},
	    series: [//数组第一个元素默认折线图，第二个默认K线图
	        {
	            type: 'line',
	            name: '',
	            data: [],
	            zlevel: 0,
	            z: 2
	        },
	        {
	            type: 'candlestick',
	            name: '',
	            data: [],
	            barWidth: 0,
	            barMinWidth: 0,
	            barMaxWidth: 0,
	            dimensions: ['date','open','close','highest','lowest'],//给data中每个维度赋予名称
	            zlevel: 0,
	            z: 2
	        }
	    ],
	    zlevel: 0,
	    z: 2,
	    coordinateSystem: 'cartesian2d',
	    layout: null,
	    itemStyle: {
	        normal: {
	            color: '#c23531', // 阳线 positive
	                color0: '#314656', // 阴线 negative     '#c23531', '#314656'
	                borderWidth: 1,
	                borderColor: '#c23531',
	                borderColor0: '#314656'
	        },
	        emphasis: {
	            borderWidth: 2
	        }
	    },
	    barMaxWidth: null,
	    barMinWidth: null,
	    barWidth: null
	};
	module.exports = defaultOption;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/9/6.
	 */

	var grid = __webpack_require__(18);
	var coordinateSystemCreators = {};
	function CoordinateSystemManager() {

	    this._coordinateSystems = [];
	}
	CoordinateSystemManager.prototype = {
	    constructor: CoordinateSystemManager,
	    create: function() {
	        var coordinateSystems = [];
	        var gridList = grid.create();
	        this._coordinateSystems = coordinateSystems.concat(gridList || []);
	    },
	    update: function() {
	        //console.log("this._coordinateSystems",this._coordinateSystems);
	        var coordSys = this._coordinateSystems;
	        //coordSys[0].update && coordSys[0].update();
	        coordSys[0].update();
	    }
	};
	//CoordinateSystemManager.register = function (type, coordinateSyetemCreator) {
	//    coordinateSyetemCreators[type] = coordinateSyetemCreator;
	//};
	module.exports = CoordinateSystemManager;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/9/4.
	 */
	var Cartesian = __webpack_require__(19);
	var Axis2D = __webpack_require__(20);
	var gridModel = {
	    type: 'grid',
	    dependencies: ['xAxis', 'yAxis'],
	    layoutMode: 'box',
	    coordinateSystem: null,
	    defaultOption: {
	        show: false,
	        zlevel: 0,
	        z: 0,
	        left: '10%',
	        top: 60,
	        right: '10%',
	        bottom: 60,
	        // If grid size contain label
	        containLabel: false,
	        // width: {totalWidth} - left - right,
	        // height: {totalHeight} - top - bottom,
	        backgroundColor: 'rgba(0,0,0,0)',
	        borderWidth: 1,
	        borderColor: '#ccc'
	    }
	};
	function Grid(gridModel) {
	    this._coordsMap = {};
	    this._coordsList = [];
	    this._axesMap = {};
	    this._axesList = [];
	    this._initCartesian(gridModel);
	    this._model = gridModel;
	}
	Grid.prototype.type = 'grid';
	Grid.prototype.update = function () {
	    var axesMap = this._axesMap;
	    this._updateScale();//调整比例
	};
	Grid.prototype._initCartesian = function(gridModel) {
	    var self = this;
	    var axisPositionUsed = {
	        left: false,
	        right: false,
	        top: false,
	        bottom: false
	    };
	    var axesMap = {
	        x: {},
	        y: {}
	    };
	    var axesCount = {
	        x: 0,
	        y: 0
	    };
	    this._axesMap = {};
	    this._axesList = [];
	    //if (!axesCount.x || !axesCount.y) {
	    //    this._axesMap = {};
	    //    this._axesList = [];
	    //    return;
	    //}
	    createAxisCreator('x');
	    createAxisCreator('y');
	    //Create axis
	    //实例化坐标系，相应添加XY轴
	    this._axesMap = axesMap;
	    var key = 'x0y0';
	    var cartesian = new Cartesian(key);
	    cartesian.grid = this;
	    this._coordsMap[key] = cartesian;
	    this._coordsList.push(cartesian);
	    //cartesian.addAxis(xAxis);
	    //cartesian.addAxis(yAxis);
	    function createAxisCreator(axisType) {
	        //console.log('创造X或Y轴');
	        //var axisPosition = axisModel.get('position');
	        var axis = new Axis2D(
	            axisType, {},
	            [0, 0],
	            'type',
	            'top'
	        );
	        self._axesList.push(axis);
	        axesMap[axisType]['0'] = axis;
	        axesCount[axisType]++;
	    }
	};
	Grid.prototype.resize = function() {};
	Grid.prototype._updateScale = function () {};
	Grid.create = function() {
	    var grids = [];
	    var grid = new Grid(gridModel);
	    grid.name = 'grid_01';
	    grid.resize();
	    grids.push(grid);
	    return grid;
	};
	module.exports = Grid;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/9/7.
	 */
	var zrUtil = __webpack_require__(4);
	function dimAxisMapper(dim) {
	    return this._axes[dim];
	}
	var Cartesian = function (name) {
	    this._axes = {};
	    this._dimList = [];
	    this.name = name || '';
	};
	Cartesian.prototype = {
	    constructor: Cartesian,
	    type: 'cartesian2D',
	    dimensions: ['x', 'y'],
	    getAxis: function (dim) {
	        return this._axes[dim];
	    },
	    getAxes: function () {
	        return zrUtil.map(this._dimList, dimAxisMapper, this);
	    },
	    getAxesByScale: function (scaleType) {
	        scaleType = scaleType.toLowerCase();
	        return zrUtil.filter(
	            this.getAxes(),
	            function (axis) {
	                return axis.scale.type === scaleType;
	            }
	        );
	    },
	    addAxis: function (axis) {
	        var dim = axis.dim;

	        this._axes[dim] = axis;

	        this._dimList.push(dim);
	    },
	    dataToCoord: function (val) {
	        return this._dataCoordConvert(val, 'dataToCoord');
	    },
	    coordToData: function (val) {
	        return this._dataCoordConvert(val, 'coordToData');
	    },
	    _dataCoordConvert: function (input, method) {
	        var dimList = this._dimList;

	        var output = input instanceof Array ? [] : {};

	        for (var i = 0; i < dimList.length; i++) {
	            var dim = dimList[i];
	            var axis = this._axes[dim];

	            output[dim] = axis[method](input[dim]);
	        }

	        return output;
	    },
	    getBaseAxis: function () {
	        return this.getAxesByScale('ordinal')[0]
	            || this.getAxesByScale('time')[0]
	            || this.getAxis('x');
	    },
	    containPoint: function (point) {
	        var axisX = this.getAxis('x');
	        var axisY = this.getAxis('y');
	        return axisX.contain(axisX.toLocalCoord(point[0]))
	            && axisY.contain(axisY.toLocalCoord(point[1]));
	    },
	    containData: function (data) {
	        return this.getAxis('x').containData(data[0])
	            && this.getAxis('y').containData(data[1]);
	    },
	    dataToPoints: function (data, stack) {
	        return data.mapArray(['x', 'y'], function (x, y) {
	            return this.dataToPoint([x, y]);
	        }, stack, this);
	    },
	    dataToPoint: function (data, clamp) {
	        var xAxis = this.getAxis('x');
	        var yAxis = this.getAxis('y');
	        return [
	            xAxis.toGlobalCoord(xAxis.dataToCoord(data[0], clamp)),
	            yAxis.toGlobalCoord(yAxis.dataToCoord(data[1], clamp))
	        ];
	    },
	    pointToData: function (point, clamp) {
	        var xAxis = this.getAxis('x');
	        var yAxis = this.getAxis('y');
	        return [
	            xAxis.coordToData(xAxis.toLocalCoord(point[0]), clamp),
	            yAxis.coordToData(yAxis.toLocalCoord(point[1]), clamp)
	        ];
	    },
	    getOtherAxis: function (axis) {
	        return this.getAxis(axis.dim === 'x' ? 'y' : 'x');
	    }
	};
	module.exports = Cartesian;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/9/8.
	 */
	var zrUtil = __webpack_require__(4);
	var Axis = __webpack_require__(21);
	var Axis2D = function (dim, scale, coordExtent, axisType, position) {
	    Axis.call(this, dim, scale, coordExtent);
	    this.type = axisType || 'value';
	    this.position = position || 'bottom';
	};
	Axis2D.prototype = {

	    constructor: Axis2D,
	    index: 0,
	    onZero: false,
	    model: null,
	    isHorizontal: function () {
	        var position = this.position;
	        return position === 'top' || position === 'bottom';
	    },
	    getGlobalExtent: function () {
	        var ret = this.getExtent();
	        ret[0] = this.toGlobalCoord(ret[0]);
	        ret[1] = this.toGlobalCoord(ret[1]);
	        return ret;
	    },
	    getLabelInterval: function () {
	        var labelInterval = this._labelInterval;
	        if (!labelInterval) {
	            labelInterval = this._labelInterval = axisLabelInterval(this);
	        }
	        return labelInterval;
	    },
	    isLabelIgnored: function (idx) {
	        if (this.type === 'category') {
	            var labelInterval = this.getLabelInterval();
	            return ((typeof labelInterval === 'function')
	                && !labelInterval(idx, this.scale.getLabel(idx)))
	                || idx % (labelInterval + 1);
	        }
	    },
	    toLocalCoord: null,
	    toGlobalCoord: null

	};
	zrUtil.inherits(Axis2D, Axis);
	module.exports = Axis2D;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by JDR on 2017/9/8.
	 */


	var numberUtil = __webpack_require__(22);
	var linearMap = numberUtil.linearMap;
	var zrUtil = __webpack_require__(4);

	function fixExtentWithBands(extent, nTick) {
	    var size = extent[1] - extent[0];
	    var len = nTick;
	    var margin = size / len / 2;
	    extent[0] += margin;
	    extent[1] -= margin;
	}

	var normalizedExtent = [0, 1];
	var Axis = function (dim, scale, extent) {
	    this.dim = dim;
	    this.scale = scale;
	    this._extent = extent || [0, 0];
	    verse = false;
	    this.onBand = false;
	};

	Axis.prototype = {

	    constructor: Axis,
	    contain: function (coord) {
	        var extent = this._extent;
	        var min = Math.min(extent[0], extent[1]);
	        var max = Math.max(extent[0], extent[1]);
	        return coord >= min && coord <= max;
	    },
	    containData: function (data) {
	        return this.contain(this.dataToCoord(data));
	    },
	    getExtent: function () {
	        var ret = this._extent.slice();
	        return ret;
	    },
	    getPixelPrecision: function (dataExtent) {
	        return numberUtil.getPixelPrecision(
	            dataExtent || this.scale.getExtent(),
	            this._extent
	        );
	    },
	    setExtent: function (start, end) {
	        var extent = this._extent;
	        extent[0] = start;
	        extent[1] = end;
	    },
	    dataToCoord: function (data, clamp) {
	        var extent = this._extent;
	        var scale = this.scale;
	        data = scale.normalize(data);

	        if (this.onBand && scale.type === 'ordinal') {
	            extent = extent.slice();
	            fixExtentWithBands(extent, scale.count());
	        }

	        return linearMap(data, normalizedExtent, extent, clamp);
	    },
	    coordToData: function (coord, clamp) {
	        var extent = this._extent;
	        var scale = this.scale;

	        if (this.onBand && scale.type === 'ordinal') {
	            extent = extent.slice();
	            fixExtentWithBands(extent, scale.count());
	        }

	        var t = linearMap(coord, extent, normalizedExtent, clamp);

	        return this.scale.scale(t);
	    },
	    getTicksCoords: function (alignWithLabel) {
	        if (this.onBand && !alignWithLabel) {
	            var bands = this.getBands();
	            var coords = [];
	            for (var i = 0; i < bands.length; i++) {
	                coords.push(bands[i][0]);
	            }
	            if (bands[i - 1]) {
	                coords.push(bands[i - 1][1]);
	            }
	            return coords;
	        }
	        else {
	            return zrUtil.map(this.scale.getTicks(), this.dataToCoord, this);
	        }
	    },
	    getLabelsCoords: function () {
	        return zrUtil.map(this.scale.getTicks(), this.dataToCoord, this);
	    },
	    // FIXME Situation when labels is on ticks
	    getBands: function () {
	        var extent = this.getExtent();
	        var bands = [];
	        var len = this.scale.count();
	        var start = extent[0];
	        var end = extent[1];
	        var span = end - start;

	        for (var i = 0; i < len; i++) {
	            bands.push([
	                span * i / len + start,
	                span * (i + 1) / len + start
	            ]);
	        }
	        return bands;
	    },
	    getBandWidth: function () {
	        var axisExtent = this._extent;
	        var dataExtent = this.scale.getExtent();

	        var len = dataExtent[1] - dataExtent[0] + (this.onBand ? 1 : 0);
	        // Fix #2728, avoid NaN when only one data.
	        len === 0 && (len = 1);

	        var size = Math.abs(axisExtent[1] - axisExtent[0]);

	        return Math.abs(size) / len;
	    },
	    isBlank: function () {
	        return this._isBlank;
	    },
	    setBlank: function (isBlank) {
	        this._isBlank = isBlank;
	    }

	};

	module.exports = Axis;


/***/ }),
/* 22 */
/***/ (function(module, exports) {

	/**
	 * Created by JDR on 2017/9/8.
	 */
	/**
	 * 数值处理模块
	 * @module echarts/util/number
	 */
	var number = {};
	var RADIAN_EPSILON = 1e-4;
	function _trim(str) {
	    return str.replace(/^\s+/, '').replace(/\s+$/, '');
	}
	/**
	 * Linear mapping a value from domain to range
	 * @memberOf module:echarts/util/number
	 * @param  {(number|Array.<number>)} val
	 * @param  {Array.<number>} domain Domain extent domain[0] can be bigger than domain[1]
	 * @param  {Array.<number>} range  Range extent range[0] can be bigger than range[1]
	 * @param  {boolean} clamp
	 * @return {(number|Array.<number>}
	 */
	number.linearMap = function (val, domain, range, clamp) {
	    var subDomain = domain[1] - domain[0];
	    var subRange = range[1] - range[0];

	    if (subDomain === 0) {
	        return subRange === 0
	            ? range[0]
	            : (range[0] + range[1]) / 2;
	    }

	    // Avoid accuracy problem in edge, such as
	    // 146.39 - 62.83 === 83.55999999999999.
	    // See echarts/test/ut/spec/util/number.js#linearMap#accuracyError
	    // It is a little verbose for efficiency considering this method
	    // is a hotspot.
	    if (clamp) {
	        if (subDomain > 0) {
	            if (val <= domain[0]) {
	                return range[0];
	            }
	            else if (val >= domain[1]) {
	                return range[1];
	            }
	        }
	        else {
	            if (val >= domain[0]) {
	                return range[0];
	            }
	            else if (val <= domain[1]) {
	                return range[1];
	            }
	        }
	    }
	    else {
	        if (val === domain[0]) {
	            return range[0];
	        }
	        if (val === domain[1]) {
	            return range[1];
	        }
	    }

	    return (val - domain[0]) / subDomain * subRange + range[0];
	};

	/**
	 * Convert a percent string to absolute number.
	 * Returns NaN if percent is not a valid string or number
	 * @memberOf module:echarts/util/number
	 * @param {string|number} percent
	 * @param {number} all
	 * @return {number}
	 */
	number.parsePercent = function(percent, all) {
	    switch (percent) {
	        case 'center':
	        case 'middle':
	            percent = '50%';
	            break;
	        case 'left':
	        case 'top':
	            percent = '0%';
	            break;
	        case 'right':
	        case 'bottom':
	            percent = '100%';
	            break;
	    }
	    if (typeof percent === 'string') {
	        if (_trim(percent).match(/%$/)) {
	            return parseFloat(percent) / 100 * all;
	        }

	        return parseFloat(percent);
	    }

	    return percent == null ? NaN : +percent;
	};

	/**
	 * Fix rounding error of float numbers
	 * @param {number} x
	 * @return {number}
	 */
	number.round = function (x, precision) {
	    if (precision == null) {
	        precision = 10;
	    }
	    // Avoid range error
	    precision = Math.min(Math.max(0, precision), 20);
	    return +(+x).toFixed(precision);
	};

	number.asc = function (arr) {
	    arr.sort(function (a, b) {
	        return a - b;
	    });
	    return arr;
	};

	/**
	 * Get precision
	 * @param {number} val
	 */
	number.getPrecision = function (val) {
	    val = +val;
	    if (isNaN(val)) {
	        return 0;
	    }
	    // It is much faster than methods converting number to string as follows
	    //      var tmp = val.toString();
	    //      return tmp.length - 1 - tmp.indexOf('.');
	    // especially when precision is low
	    var e = 1;
	    var count = 0;
	    while (Math.round(val * e) / e !== val) {
	        e *= 10;
	        count++;
	    }
	    return count;
	};

	number.getPrecisionSafe = function (val) {
	    var str = val.toString();
	    var dotIndex = str.indexOf('.');
	    if (dotIndex < 0) {
	        return 0;
	    }
	    return str.length - 1 - dotIndex;
	};

	/**
	 * Minimal dicernible data precisioin according to a single pixel.
	 * @param {Array.<number>} dataExtent
	 * @param {Array.<number>} pixelExtent
	 * @return {number} precision
	 */
	number.getPixelPrecision = function (dataExtent, pixelExtent) {
	    var log = Math.log;
	    var LN10 = Math.LN10;
	    var dataQuantity = Math.floor(log(dataExtent[1] - dataExtent[0]) / LN10);
	    var sizeQuantity = Math.round(log(Math.abs(pixelExtent[1] - pixelExtent[0])) / LN10);
	    // toFixed() digits argument must be between 0 and 20.
	    var precision = Math.min(Math.max(-dataQuantity + sizeQuantity, 0), 20);
	    return !isFinite(precision) ? 20 : precision;
	};

	// Number.MAX_SAFE_INTEGER, ie do not support.
	number.MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * To 0 - 2 * PI, considering negative radian.
	 * @param {number} radian
	 * @return {number}
	 */
	number.remRadian = function (radian) {
	    var pi2 = Math.PI * 2;
	    return (radian % pi2 + pi2) % pi2;
	};

	/**
	 * @param {type} radian
	 * @return {boolean}
	 */
	number.isRadianAroundZero = function (val) {
	    return val > -RADIAN_EPSILON && val < RADIAN_EPSILON;
	};

	/**
	 * @param {string|Date|number} value
	 * @return {Date} date
	 */
	number.parseDate = function (value) {
	    if (value instanceof Date) {
	        return value;
	    }
	    else if (typeof value === 'string') {
	        // Treat as ISO format. See issue #3623
	        var ret = new Date(value);
	        if (isNaN(+ret)) {
	            // FIXME new Date('1970-01-01') is UTC, new Date('1970/01/01') is local
	            ret = new Date(new Date(value.replace(/-/g, '/')) - new Date('1970/01/01'));
	        }
	        return ret;
	    }

	    return new Date(Math.round(value));
	};

	/**
	 * Quantity of a number. e.g. 0.1, 1, 10, 100
	 * @param  {number} val
	 * @return {number}
	 */
	number.quantity = function (val) {
	    return Math.pow(10, Math.floor(Math.log(val) / Math.LN10));
	};

	// "Nice Numbers for Graph Labels" of Graphic Gems
	/**
	 * find a “nice” number approximately equal to x. Round the number if round = true, take ceiling if round = false
	 * The primary observation is that the “nicest” numbers in decimal are 1, 2, and 5, and all power-of-ten multiples of these numbers.
	 * @param  {number} val
	 * @param  {boolean} round
	 * @return {number}
	 */
	number.nice = function (val, round) {
	    var exp10 = number.quantity(val);
	    var f = val / exp10; // between 1 and 10
	    var nf;
	    if (round) {
	        if (f < 1.5) { nf = 1; }
	        else if (f < 2.5) { nf = 2; }
	        else if (f < 4) { nf = 3; }
	        else if (f < 7) { nf = 5; }
	        else { nf = 10; }
	    }
	    else {
	        if (f < 1) { nf = 1; }
	        else if (f < 2) { nf = 2; }
	        else if (f < 3) { nf = 3; }
	        else if (f < 5) { nf = 5; }
	        else { nf = 10; }
	    }
	    return nf * exp10;
	};

	/**
	 * Order intervals asc, and split them when overlap.
	 * expect(numberUtil.reformIntervals([
	 *     {interval: [18, 62], close: [1, 1]},
	 *     {interval: [-Infinity, -70], close: [0, 0]},
	 *     {interval: [-70, -26], close: [1, 1]},
	 *     {interval: [-26, 18], close: [1, 1]},
	 *     {interval: [62, 150], close: [1, 1]},
	 *     {interval: [106, 150], close: [1, 1]},
	 *     {interval: [150, Infinity], close: [0, 0]}
	 * ])).toEqual([
	 *     {interval: [-Infinity, -70], close: [0, 0]},
	 *     {interval: [-70, -26], close: [1, 1]},
	 *     {interval: [-26, 18], close: [0, 1]},
	 *     {interval: [18, 62], close: [0, 1]},
	 *     {interval: [62, 150], close: [0, 1]},
	 *     {interval: [150, Infinity], close: [0, 0]}
	 * ]);
	 * @param {Array.<Object>} list, where `close` mean open or close
	 *        of the interval, and Infinity can be used.
	 * @return {Array.<Object>} The origin list, which has been reformed.
	 */
	number.reformIntervals = function (list) {
	    list.sort(function (a, b) {
	        return littleThan(a, b, 0) ? -1 : 1;
	    });

	    var curr = -Infinity;
	    var currClose = 1;
	    for (var i = 0; i < list.length;) {
	        var interval = list[i].interval;
	        var close = list[i].close;

	        for (var lg = 0; lg < 2; lg++) {
	            if (interval[lg] <= curr) {
	                interval[lg] = curr;
	                close[lg] = !lg ? 1 - currClose : 1;
	            }
	            curr = interval[lg];
	            currClose = close[lg];
	        }

	        if (interval[0] === interval[1] && close[0] * close[1] !== 1) {
	            list.splice(i, 1);
	        }
	        else {
	            i++;
	        }
	    }

	    return list;

	    function littleThan(a, b, lg) {
	        return a.interval[lg] < b.interval[lg]
	            || (
	                a.interval[lg] === b.interval[lg]
	                && (
	                    (a.close[lg] - b.close[lg] === (!lg ? 1 : -1))
	                    || (!lg && littleThan(a, b, 1))
	                )
	            );
	    }
	};
	/**
	 * parseFloat NaNs numeric-cast false positives (null|true|false|"")
	 * ...but misinterprets leading-number strings, particularly hex literals ("0x...")
	 * subtraction forces infinities to NaN
	 * @param {*} v
	 * @return {boolean}
	 */
	number.isNumeric = function (v) {
	    return v - parseFloat(v) >= 0;
	};

	module.exports = number;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(24);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// Prepare cssTransformation
	var transform;

	var options = {"hmr":true}
	options.transform = transform
	// add the styles to the DOM
	var update = __webpack_require__(26)(content, options);
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../node_modules/css-loader/index.js!./global.css", function() {
				var newContent = require("!!../../node_modules/css-loader/index.js!./global.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(25)(undefined);
	// imports


	// module
	exports.push([module.id, "#JdsChart_Loading{\n    position: absolute;\n    top: 25%;\n    left: 42%;\n    background: #ffffff;\n    z-index: 99;\n}\n#JdsChart_Loading > div:nth-child(0) {\n    -webkit-animation: JdsChart_scale 0.75s 0s infinite cubic-bezier(.2, .68, .18, 1.08);\n    animation: JdsChart_scale 0.75s 0s infinite cubic-bezier(.2, .68, .18, 1.08); }\n#JdsChart_Loading > div:nth-child(1) {\n    -webkit-animation: JdsChart_scale 0.75s 0.12s infinite cubic-bezier(.2, .68, .18, 1.08);\n    animation: JdsChart_scale 0.75s 0.12s infinite cubic-bezier(.2, .68, .18, 1.08); }\n#JdsChart_Loading > div:nth-child(2) {\n    -webkit-animation: JdsChart_scale 0.75s 0.24s infinite cubic-bezier(.2, .68, .18, 1.08);\n    animation: JdsChart_scale 0.75s 0.24s infinite cubic-bezier(.2, .68, .18, 1.08); }\n#JdsChart_Loading > div:nth-child(3) {\n    -webkit-animation: JdsChart_scale 0.75s 0.36s infinite cubic-bezier(.2, .68, .18, 1.08);\n    animation: JdsChart_scale 0.75s 0.36s infinite cubic-bezier(.2, .68, .18, 1.08); }\n#JdsChart_Loading > div {\n    background-color: #333333;\n    width: 10px;\n    height: 10px;\n    border-radius: 100%;\n    margin: 2px;\n    -webkit-animation-fill-mode: both;\n    animation-fill-mode: both;\n    display: inline-block;\n}\n@-webkit-keyframes JdsChart_scale {\n    0% {\n        -webkit-transform: scale(1);\n        transform: scale(1);\n        opacity: 1; }\n\n    45% {\n        -webkit-transform: scale(0.1);\n        transform: scale(0.1);\n        opacity: 0.7; }\n\n    80% {\n        -webkit-transform: scale(1);\n        transform: scale(1);\n        opacity: 1; }\n}\n@keyframes JdsChart_scale {\n    0% {\n        -webkit-transform: scale(1);\n        transform: scale(1);\n        opacity: 1; }\n\n    45% {\n        -webkit-transform: scale(0.1);\n        transform: scale(0.1);\n        opacity: 0.7; }\n\n    80% {\n        -webkit-transform: scale(1);\n        transform: scale(1);\n        opacity: 1; }\n}", ""]);

	// exports


/***/ }),
/* 25 */
/***/ (function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function(useSourceMap) {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			return this.map(function (item) {
				var content = cssWithMappingToString(item, useSourceMap);
				if(item[2]) {
					return "@media " + item[2] + "{" + content + "}";
				} else {
					return content;
				}
			}).join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};

	function cssWithMappingToString(item, useSourceMap) {
		var content = item[1] || '';
		var cssMapping = item[3];
		if (!cssMapping) {
			return content;
		}

		if (useSourceMap && typeof btoa === 'function') {
			var sourceMapping = toComment(cssMapping);
			var sourceURLs = cssMapping.sources.map(function (source) {
				return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
			});

			return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
		}

		return [content].join('\n');
	}

	// Adapted from convert-source-map (MIT)
	function toComment(sourceMap) {
		// eslint-disable-next-line no-undef
		var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
		var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

		return '/*# ' + data + ' */';
	}


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/

	var stylesInDom = {};

	var	memoize = function (fn) {
		var memo;

		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	};

	var isOldIE = memoize(function () {
		// Test for IE <= 9 as proposed by Browserhacks
		// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
		// Tests for existence of standard globals is to allow style-loader
		// to operate correctly into non-standard environments
		// @see https://github.com/webpack-contrib/style-loader/issues/177
		return window && document && document.all && !window.atob;
	});

	var getElement = (function (fn) {
		var memo = {};

		return function(selector) {
			if (typeof memo[selector] === "undefined") {
				var styleTarget = fn.call(this, selector);
				// Special case to return head of iframe instead of iframe itself
				if (styleTarget instanceof window.HTMLIFrameElement) {
					try {
						// This will throw an exception if access to iframe is blocked
						// due to cross-origin restrictions
						styleTarget = styleTarget.contentDocument.head;
					} catch(e) {
						styleTarget = null;
					}
				}
				memo[selector] = styleTarget;
			}
			return memo[selector]
		};
	})(function (target) {
		return document.querySelector(target)
	});

	var singleton = null;
	var	singletonCounter = 0;
	var	stylesInsertedAtTop = [];

	var	fixUrls = __webpack_require__(27);

	module.exports = function(list, options) {
		if (false) {
			if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};

		options.attrs = typeof options.attrs === "object" ? options.attrs : {};

		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (!options.singleton) options.singleton = isOldIE();

		// By default, add <style> tags to the <head> element
		if (!options.insertInto) options.insertInto = "head";

		// By default, add <style> tags to the bottom of the target
		if (!options.insertAt) options.insertAt = "bottom";

		var styles = listToStyles(list, options);

		addStylesToDom(styles, options);

		return function update (newList) {
			var mayRemove = [];

			for (var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];

				domStyle.refs--;
				mayRemove.push(domStyle);
			}

			if(newList) {
				var newStyles = listToStyles(newList, options);
				addStylesToDom(newStyles, options);
			}

			for (var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];

				if(domStyle.refs === 0) {
					for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

					delete stylesInDom[domStyle.id];
				}
			}
		};
	};

	function addStylesToDom (styles, options) {
		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			if(domStyle) {
				domStyle.refs++;

				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}

				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];

				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}

				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles (list, options) {
		var styles = [];
		var newStyles = {};

		for (var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = options.base ? item[0] + options.base : item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};

			if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
			else newStyles[id].parts.push(part);
		}

		return styles;
	}

	function insertStyleElement (options, style) {
		var target = getElement(options.insertInto)

		if (!target) {
			throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
		}

		var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

		if (options.insertAt === "top") {
			if (!lastStyleElementInsertedAtTop) {
				target.insertBefore(style, target.firstChild);
			} else if (lastStyleElementInsertedAtTop.nextSibling) {
				target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				target.appendChild(style);
			}
			stylesInsertedAtTop.push(style);
		} else if (options.insertAt === "bottom") {
			target.appendChild(style);
		} else if (typeof options.insertAt === "object" && options.insertAt.before) {
			var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
			target.insertBefore(style, nextSibling);
		} else {
			throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
		}
	}

	function removeStyleElement (style) {
		if (style.parentNode === null) return false;
		style.parentNode.removeChild(style);

		var idx = stylesInsertedAtTop.indexOf(style);
		if(idx >= 0) {
			stylesInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement (options) {
		var style = document.createElement("style");

		options.attrs.type = "text/css";

		addAttrs(style, options.attrs);
		insertStyleElement(options, style);

		return style;
	}

	function createLinkElement (options) {
		var link = document.createElement("link");

		options.attrs.type = "text/css";
		options.attrs.rel = "stylesheet";

		addAttrs(link, options.attrs);
		insertStyleElement(options, link);

		return link;
	}

	function addAttrs (el, attrs) {
		Object.keys(attrs).forEach(function (key) {
			el.setAttribute(key, attrs[key]);
		});
	}

	function addStyle (obj, options) {
		var style, update, remove, result;

		// If a transform function was defined, run it on the css
		if (options.transform && obj.css) {
		    result = options.transform(obj.css);

		    if (result) {
		    	// If transform returns a value, use that instead of the original css.
		    	// This allows running runtime transformations on the css.
		    	obj.css = result;
		    } else {
		    	// If the transform function returns a falsy value, don't add this css.
		    	// This allows conditional loading of css
		    	return function() {
		    		// noop
		    	};
		    }
		}

		if (options.singleton) {
			var styleIndex = singletonCounter++;

			style = singleton || (singleton = createStyleElement(options));

			update = applyToSingletonTag.bind(null, style, styleIndex, false);
			remove = applyToSingletonTag.bind(null, style, styleIndex, true);

		} else if (
			obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function"
		) {
			style = createLinkElement(options);
			update = updateLink.bind(null, style, options);
			remove = function () {
				removeStyleElement(style);

				if(style.href) URL.revokeObjectURL(style.href);
			};
		} else {
			style = createStyleElement(options);
			update = applyToTag.bind(null, style);
			remove = function () {
				removeStyleElement(style);
			};
		}

		update(obj);

		return function updateStyle (newObj) {
			if (newObj) {
				if (
					newObj.css === obj.css &&
					newObj.media === obj.media &&
					newObj.sourceMap === obj.sourceMap
				) {
					return;
				}

				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;

			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag (style, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (style.styleSheet) {
			style.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = style.childNodes;

			if (childNodes[index]) style.removeChild(childNodes[index]);

			if (childNodes.length) {
				style.insertBefore(cssNode, childNodes[index]);
			} else {
				style.appendChild(cssNode);
			}
		}
	}

	function applyToTag (style, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			style.setAttribute("media", media)
		}

		if(style.styleSheet) {
			style.styleSheet.cssText = css;
		} else {
			while(style.firstChild) {
				style.removeChild(style.firstChild);
			}

			style.appendChild(document.createTextNode(css));
		}
	}

	function updateLink (link, options, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		/*
			If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
			and there is no publicPath defined then lets turn convertToAbsoluteUrls
			on by default.  Otherwise default to the convertToAbsoluteUrls option
			directly
		*/
		var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

		if (options.convertToAbsoluteUrls || autoFixUrls) {
			css = fixUrls(css);
		}

		if (sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = link.href;

		link.href = URL.createObjectURL(blob);

		if(oldSrc) URL.revokeObjectURL(oldSrc);
	}


/***/ }),
/* 27 */
/***/ (function(module, exports) {

	
	/**
	 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
	 * embed the css on the page. This breaks all relative urls because now they are relative to a
	 * bundle instead of the current page.
	 *
	 * One solution is to only use full urls, but that may be impossible.
	 *
	 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
	 *
	 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
	 *
	 */

	module.exports = function (css) {
	  // get current location
	  var location = typeof window !== "undefined" && window.location;

	  if (!location) {
	    throw new Error("fixUrls requires window.location");
	  }

		// blank or null?
		if (!css || typeof css !== "string") {
		  return css;
	  }

	  var baseUrl = location.protocol + "//" + location.host;
	  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

		// convert each url(...)
		/*
		This regular expression is just a way to recursively match brackets within
		a string.

		 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
		   (  = Start a capturing group
		     (?:  = Start a non-capturing group
		         [^)(]  = Match anything that isn't a parentheses
		         |  = OR
		         \(  = Match a start parentheses
		             (?:  = Start another non-capturing groups
		                 [^)(]+  = Match anything that isn't a parentheses
		                 |  = OR
		                 \(  = Match a start parentheses
		                     [^)(]*  = Match anything that isn't a parentheses
		                 \)  = Match a end parentheses
		             )  = End Group
	              *\) = Match anything and then a close parens
	          )  = Close non-capturing group
	          *  = Match anything
	       )  = Close capturing group
		 \)  = Match a close parens

		 /gi  = Get all matches, not the first.  Be case insensitive.
		 */
		var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
			// strip quotes (if they exist)
			var unquotedOrigUrl = origUrl
				.trim()
				.replace(/^"(.*)"$/, function(o, $1){ return $1; })
				.replace(/^'(.*)'$/, function(o, $1){ return $1; });

			// already a full url? no change
			if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
			  return fullMatch;
			}

			// convert the url to a full url
			var newUrl;

			if (unquotedOrigUrl.indexOf("//") === 0) {
			  	//TODO: should we add protocol?
				newUrl = unquotedOrigUrl;
			} else if (unquotedOrigUrl.indexOf("/") === 0) {
				// path should be relative to the base url
				newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
			} else {
				// path should be relative to current directory
				newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
			}

			// send back the fixed url(...)
			return "url(" + JSON.stringify(newUrl) + ")";
		});

		// send back the fixed css
		return fixedCss;
	};


/***/ })
/******/ ])
});
;
var jdschart = {
    version: '2.0.0',
    dependencies: {
        none: '0.0.0'
    }
};
var idBase = new Date() - 0;
var config = require('./core/config');
var Scale = require("./scale/Scale");
var Storage = require('./Storage');
var util = require('./core/util');
var Handler = require('./Event/Handler');
var HandlerProxy = require('./dom/HandlerProxy');
var Painter = require('./Painter');
var defaultOption = require('./graphic/defaultOptions');
var CoordinateSystemManager = require("./Coordinate2D/CoordinateSystem");
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

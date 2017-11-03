/**
 * Created by JDR on 2017/9/22.
 */
var Drag = require('./Drag');
var Event = require('./Event');
var util = require('../core/util');
var config = require('../core/config');
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
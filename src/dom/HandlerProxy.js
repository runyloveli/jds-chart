/**
 * Created by JDR on 2017/9/28.
 */
var Event = require('../Event/Event');
var util = require('../core/util');
var env = require("../core/env");
var eventTool = require('../core/event');
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
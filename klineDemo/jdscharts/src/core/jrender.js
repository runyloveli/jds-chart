/**
 * Created by JDR on 2017/8/21.
 */
var Handler = require('./Handler');
var HandlerProxy = require('./HandlerProxy');
var env = require('./env');
var Storager = require('./Storage');
var painterCtors = {
    canvas: require('./Painter')
};
var jrender = {};
jrender.version = '1.0.0';
var instances = {};
//初始化jrender实例
jrender.init = function (dom, opts) {
    var jr = new JRender(guid(), dom, opts);
    instances[jr.id] = jr;
    return jr;
};
//注册画法（canvas，svg，vml三选一）
jrender.registerPainter = function (type, Ctor) {
    painterCtors[name] = Ctor;
};
function guid () {
    var idStart = 0x0907;
    return idStart++;
}
function JRender (id, dom, opts) {
    opts = opts || {};
    this.dom = dom;
    this.id = id;
    var self = this;
    var storage = new Storager();
    var rendererType = 'canvas';
    var painter = new painterCtors[rendererType](dom, storage, opts);
    this.storage = storage;
    this.painter = painter;
    var handerProxy = !env.node ? new HandlerProxy(painter.getViewportRoot()) : null;
    this.handler = new Handler(storage, painter, handerProxy, painter.root);
    window.zrender = this;
    console.log(this);
    this._needsRefresh = false;
    var oldDelFromMap = storage.delFromMap;
    var oldAddToMap = storage.addToMap;

    storage.delFromMap = function (elId) {
        var el = storage.get(elId);

        oldDelFromMap.call(storage, elId);

        el && el.removeSelfFromZr(self);
    };

    storage.addToMap = function (el) {
        oldAddToMap.call(storage, el);

        el.addSelfToZr(self);
    };
}
JRender.prototype = {

    constructor: JRender,
    /**
     * 获取实例唯一标识
     * @return {string}
     */
    getId: function () {
        return this.id;
    },

    /**
     * 添加元素后就会渲染
     * @param  {module:zrender/Element} el
     */
    add: function (el) {
        this.storage.addRoot(el);
        this._needsRefresh = true;
    },

    /**
     * 删除元素
     * @param  {module:zrender/Element} el
     */
    remove: function (el) {
        this.storage.delRoot(el);
        this._needsRefresh = true;
    },

    /**
     * Change configuration of layer
     * @param {string} zLevel
     * @param {Object} config
     * @param {string} [config.clearColor=0] Clear color
     * @param {string} [config.motionBlur=false] If enable motion blur
     * @param {number} [config.lastFrameAlpha=0.7] Motion blur factor. Larger value cause longer trailer
     */
    configLayer: function (zLevel, config) {
        this.painter.configLayer(zLevel, config);
        this._needsRefresh = true;
    },

    /**
     * Repaint the canvas immediately
     */
    refreshImmediately: function () {
        // Clear needsRefresh ahead to avoid something wrong happens in refresh
        // Or it will cause zrender refreshes again and again.
        this._needsRefresh = false;
        this.painter.refresh();
        /**
         * Avoid trigger zr.refresh in Element#beforeUpdate hook
         */
        this._needsRefresh = false;
    },

    /**
     * Mark and repaint the canvas in the next frame of browser
     */
    refresh: function() {
        this._needsRefresh = true;
    },

    /**
     * Perform all refresh
     */
    flush: function () {
        if (this._needsRefresh) {
            this.refreshImmediately();
        }
        if (this._needsRefreshHover) {
            this.refreshHoverImmediately();
        }
    },

    /**
     * Add element to hover layer
     * @param  {module:zrender/Element} el
     * @param {Object} style
     */
    addHover: function (el, style) {
        if (this.painter.addHover) {
            this.painter.addHover(el, style);
            this.refreshHover();
        }
    },

    /**
     * Add element from hover layer
     * @param  {module:zrender/Element} el
     */
    removeHover: function (el) {
        if (this.painter.removeHover) {
            this.painter.removeHover(el);
            this.refreshHover();
        }
    },

    /**
     * Clear all hover elements in hover layer
     * @param  {module:zrender/Element} el
     */
    clearHover: function () {
        if (this.painter.clearHover) {
            this.painter.clearHover();
            this.refreshHover();
        }
    },

    /**
     * Refresh hover in next frame
     */
    refreshHover: function () {
        this._needsRefreshHover = true;
    },

    /**
     * Refresh hover immediately
     */
    refreshHoverImmediately: function () {
        this._needsRefreshHover = false;
        this.painter.refreshHover && this.painter.refreshHover();
    },

    /**
     * Resize the canvas.
     * Should be invoked when container size is changed
     * @param {Object} [opts]
     * @param {number|string} [opts.width] Can be 'auto' (the same as null/undefined)
     * @param {number|string} [opts.height] Can be 'auto' (the same as null/undefined)
     */
    resize: function(opts) {
        opts = opts || {};
        this.painter.resize(opts.width, opts.height);
        this.handler.resize();
    },

    /**
     * Stop and clear all animation immediately
     */
    clearAnimation: function () {
        this.animation.clear();
    },

    /**
     * Get container width
     */
    getWidth: function() {
        return this.painter.getWidth();
    },

    /**
     * Get container height
     */
    getHeight: function() {
        return this.painter.getHeight();
    },

    /**
     * Export the canvas as Base64 URL
     * @param {string} type
     * @param {string} [backgroundColor='#fff']
     * @return {string} Base64 URL
     */
    // toDataURL: function(type, backgroundColor) {
    //     return this.painter.getRenderedCanvas({
    //         backgroundColor: backgroundColor
    //     }).toDataURL(type);
    // },

    /**
     * Converting a path to image.
     * It has much better performance of drawing image rather than drawing a vector path.
     * @param {module:zrender/graphic/Path} e
     * @param {number} width
     * @param {number} height
     */
    pathToImage: function(e, width, height) {
        var id = guid();
        return this.painter.pathToImage(id, e, width, height);
    },

    /**
     * Set default cursor
     * @param {string} [cursorStyle='default'] 例如 crosshair
     */
    setCursorStyle: function (cursorStyle) {
        this.handler.setCursorStyle(cursorStyle);
    },

    /**
     * Bind event
     *
     * @param {string} eventName Event name
     * @param {Function} eventHandler Handler function
     * @param {Object} [context] Context object
     */
    on: function(eventName, eventHandler, context) {
        this.handler.on(eventName, eventHandler, context);
    },

    /**
     * Unbind event
     * @param {string} eventName Event name
     * @param {Function} [eventHandler] Handler function
     */
    off: function(eventName, eventHandler) {
        this.handler.off(eventName, eventHandler);
    },

    /**
     * Trigger event manually
     *
     * @param {string} eventName Event name
     * @param {event=} event Event object
     */
    trigger: function (eventName, event) {
        this.handler.trigger(eventName, event);
    },


    /**
     * Clear all objects and the canvas.
     */
    clear: function () {
        this.storage.delRoot();
        this.painter.clear();
    },

    /**
     * Dispose self.
     */
    dispose: function () {
        this.animation.stop();

        this.clear();
        this.storage.dispose();
        this.painter.dispose();
        this.handler.dispose();

        this.animation =
            this.storage =
                this.painter =
                    this.handler = null;

        delInstance(this.id);
    }
};

module.exports = jrender;

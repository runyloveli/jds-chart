/**
 * Created by JDR on 2017/9/4.
 */

function createDom(id, type, painter, dpr) {
    var newDom = document.createElement(type);
    var width = painter.getWidth();
    var height = painter.getHeight();
    var newDomStyle = newDom.style;
    newDomStyle.position = 'absolute';
    newDomStyle.left = 0;
    newDomStyle.top = 0;
    newDomStyle.width = width + 'px';
    newDomStyle.height = height + 'px';
    newDom.width = width * dpr;
    newDom.height = height * dpr;
    newDom.setAttribute('data-zr-dom-id', id);
    return newDom;
}
var Layer = function (id, painter, dpr) {
    var dom;
    dpr = dpr || config.devicePixelRatio;
    if(typeof id === 'string'){
        dom = createDom(id, 'canvas', painter, dpr);
    }else if(1) {
        dom = id;
        id = dom.id;
    }
    this.id = id;
    this.dom = dom;
    var domStyle = dom.style;
    if(domStyle){
        dom.onselectstart = returnFalse;
        domStyle['-webkit-user-select'] = 'none';
        domStyle['user-select'] = 'none';
        domStyle['-webkit-touch-callout'] = 'none';
        domStyle['-webkit-tap-highlight-color'] = 'rgba(0,0,0,0)';
        domStyle['padding'] = 0;
        domStyle['margin'] = 0;
        domStyle['border-width'] = 0;
    }
    this.domBack = null;
    this.ctxBack = null;
    this.painter = painter;
    this.config = null;
    this.clearColor = 0;
    this.motionBlur = false;
    this.lastFrameAlpha = 0.7;
    this.dpr = drp;
};
Layer.prototype = {
  constructor: Layer,
    initContext: function() {
        this.ctx = this.dom.getContext('2d');
        thi.ctx.dpr = this.dpr;
    },
    resieze: function(width, height) {
        var dpr = this.dpr;
        var dom = this.dom;
        var domStyle= dom.style;
        var domBack = this.domBack;
        domStyle.width = width + 'px';
        domStyle.height = height + 'px';
        dom.width = width * dpr;
        dom.height = height * dpr;
        if (domBack) {
            domBack.width = width * dpr;
            domBack.height = height * dpr;
            if (dpr != 1) {
                this.ctxBack.scale(dpr, dpr);
            }
        }
    },
    clear: function(clearAll) {
        var dom = this.dom;
        var ctx = this.ctx;
        var width = dom.width;
        var height = dom.height;
        var clearColor = this.clearColor;
        var dpr = this.drp;
        ctx.clearRect(0,0,width,height);
    }
};
module.exports = Layer;
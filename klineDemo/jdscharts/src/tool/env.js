
/**
 * Created by JDR on 2017/8/21.
 */
var env = {};
if (typeof navigator === 'undefined') {
    env = {
        browser: {},
        os: {},
        node: true,
        canvasSupported: true
    };
}
else {
    env = detect(navigator.userAgent);
}
function detect(ua) {
    var os = {};
    var browser = {};
    var firefox = ua.match(/Firefox\/([\d.]+)/);
    var ie = ua.match(/MSIE\s([\d.]+)/)
        || ua.match(/Trident\/.+?rv:(([\d.]+))/);
    var edge = ua.match(/Edge\/([\d.]+)/);
    var weChat = (/micromessenger/i).test(ua);
    if (firefox) {
        browser.firefox = true;
        browser.version = firefox[1];
    }
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
module.exports = env;
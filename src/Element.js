/**
 * Created by JDR on 2017/9/8.
 */
/**
 * Created by JDR on 2017/9/8.
 */
var zrUtil = require("./core/util");
var Element = function(opts) {
    this.id = opts.id || guid();
};
function guid() {
    var idStart = 0x0907;

    return function () {
        return idStart++;
    };
}
Element.prototype = {
    constructor: Element,
    type: 'element',
    name: '',
    clipPath: null
};
module.exports = Element;
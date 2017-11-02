/**
 * Created by JDR on 2017/9/11.
 */
var util = require("../core/util");
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
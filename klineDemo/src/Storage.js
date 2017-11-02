/**
 * Created by JDR on 2017/9/8.
 */
var util = require("./core/util");
var Group = require("./Group");
var timsort = require('./core/timesort');
var env = require('./core/env');
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
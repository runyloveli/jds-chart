/**
 * Created by JDR on 2017/8/21.
 */
var util = require("../tool/util");
var env = require("./env");
var Group = require('./Group');
var timsort = require('./timsort');
function shapeCompareFunc(a, b) {
    if (a.zlevel === b.zlevel) {
        if (a.z === b.z) {
            // if (a.z2 === b.z2) {
            //     // FIXME Slow has renderidx compare
            //     // http://stackoverflow.com/questions/20883421/sorting-in-javascript-should-every-compare-function-have-a-return-0-statement
            //     // https://github.com/v8/v8/blob/47cce544a31ed5577ffe2963f67acb4144ee0232/src/js/array.js#L1012
            //     return a.__renderidx - b.__renderidx;
            // }
            return a.z2 - b.z2;
        }
        return a.z - b.z;
    }
    return a.zlevel - b.zlevel;
}
var Storage = function () {
    // 所有常规形状，id索引的map
    this._elements = {};
    //和this._elements存放的元素一样，只不过是数组
    this._roots = [];
    //和this.roots一样
    this._displayList = [];
    //this._displayList的长度
    this._displayListLen = 0;
};
Storage.prototype = {

    constructor: Storage,

    /**
     * @param  {Function} cb
     *
     */
    traverse: function (cb, context) {
        for (var i = 0; i < this._roots.length; i++) {
            this._roots[i].traverse(cb, context);
        }
    },

    /**
     * 返回所有图形的绘制队列
     * @param {boolean} [update=false] 是否在返回前更新该数组
     * @param {boolean} [includeIgnore=false] 是否包含 ignore 的数组, 在 update 为 true 的时候有效
     *
     * 详见{@link module:zrender/graphic/Displayable.prototype.updateDisplayList}
     * @return {Array.<module:zrender/graphic/Displayable>}
     */
    getDisplayList: function (update, includeIgnore) {
        includeIgnore = includeIgnore || false;
        if (update) {
            this.updateDisplayList(includeIgnore);
        }
        return this._displayList;
    },

    /**
     * 更新图形的绘制队列。
     * 每次绘制前都会调用，该方法会先深度优先遍历整个树，更新所有Group和Shape的变换并且把所有可见的Shape保存到数组中，
     * 最后根据绘制的优先级（zlevel > z > 插入顺序）排序得到绘制队列
     * @param {boolean} [includeIgnore=false] 是否包含 ignore 的数组
     */
    updateDisplayList: function (includeIgnore) {
        this._displayListLen = 0;
        var roots = this._roots;
        var displayList = this._displayList;
        for (var i = 0, len = roots.length; i < len; i++) {
            this._updateAndAddDisplayable(roots[i], null, includeIgnore);
        }
        displayList.length = this._displayListLen;

        // for (var i = 0, len = displayList.length; i < len; i++) {
        //     displayList[i].__renderidx = i;
        // }

        // displayList.sort(shapeCompareFunc);
        env.canvasSupported && timsort(displayList, shapeCompareFunc);
    },

    _updateAndAddDisplayable: function (el, clipPaths, includeIgnore) {

        if (el.ignore && !includeIgnore) {
            return;
        }

        el.beforeUpdate();

        if (el.__dirty) {//el.__dirty为true

            el.update();
            //核心：更新 (=>element.js[update]=>Tansformable.js[updateTransform])

        }

        el.afterUpdate();

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

        if (el.isGroup) {
            var children = el._children;

            for (var i = 0; i < children.length; i++) {
                var child = children[i];

                // Force to mark as dirty if group is dirty
                // FIXME __dirtyPath ?
                if (el.__dirty) {
                    child.__dirty = true;
                }

                this._updateAndAddDisplayable(child, clipPaths, includeIgnore);
            }

            // Mark group clean here
            el.__dirty = false;

        }
        else {
            el.__clipPaths = clipPaths;

            this._displayList[this._displayListLen++] = el;
        }
    },

    /**
     * 添加图形(Shape)或者组(Group)到根节点
     * @param {module:zrender/Element} el
     */
    addRoot: function (el) {
        // Element has been added 已经存在this._elements则return,否则则保存
        if (this._elements[el.id]) {
            return;
        }
        //是Group的话就addChildrenToStorage
        if (el instanceof Group) {
            el.addChildrenToStorage(this);
        }

        this.addToMap(el);
        this._roots.push(el);//保存到this._roots
    },

    /**
     * 删除指定的图形(Shape)或者组(Group)
     * @param {string|Array.<string>} [elId] 如果为空清空整个Storage
     */
    delRoot: function (elId) {
        if (elId == null) {
            // 不指定elId清空
            for (var i = 0; i < this._roots.length; i++) {
                var root = this._roots[i];
                if (root instanceof Group) {
                    root.delChildrenFromStorage(this);
                }
            }

            this._elements = {};
            this._roots = [];
            this._displayList = [];
            this._displayListLen = 0;

            return;
        }

        if (elId instanceof Array) {
            for (var i = 0, l = elId.length; i < l; i++) {
                this.delRoot(elId[i]);
            }
            return;
        }

        var el;
        if (typeof(elId) == 'string') {
            el = this._elements[elId];
        }
        else {
            el = elId;
        }

        var idx = util.indexOf(this._roots, el);
        if (idx >= 0) {
            this.delFromMap(el.id);
            this._roots.splice(idx, 1);
            if (el instanceof Group) {
                el.delChildrenFromStorage(this);
            }
        }
    },

    addToMap: function (el) {
        if (el instanceof Group) {
            el.__storage = this;
        }
        el.dirty(false);//标记图形元素为脏，并且在下一帧重绘

        this._elements[el.id] = el;

        return this;
    },

    get: function (elId) {
        return this._elements[elId];
    },

    delFromMap: function (elId) {
        var elements = this._elements;
        var el = elements[elId];
        if (el) {
            delete elements[elId];
            if (el instanceof Group) {
                el.__storage = null;
            }
        }

        return this;
    },

    /**
     * 清空并且释放Storage
     */
    dispose: function () {
        this._elements =
            this._renderList =
                this._roots = null;
    },

    displayableSortFunc: shapeCompareFunc
};
module.exports =  Storage;
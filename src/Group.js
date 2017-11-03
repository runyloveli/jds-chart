/**
 * Created by JDR on 2017/9/8.
 */
var zrUtil = require("./core/util");
var Group = function(opts) {
    opts = opts || {};
    this._children = {};
    this._storage = null;
    this._dirty = true;
};
Group.prototype = {
    constructor: Group,
    type: 'group',
    silent: false,
    children: function() {
        return this._children.slice();
    },
    add: function (child) {
        if (child && child !== this && child.parent !== this) {

            this._children.push(child);

            this._doAdd(child);
        }

        return this;
    },
    addBefore: function (child, nextSibling) {
        if (child && child !== this && child.parent !== this
            && nextSibling && nextSibling.parent === this) {

            var children = this._children;
            var idx = children.indexOf(nextSibling);

            if (idx >= 0) {
                children.splice(idx, 0, child);
                this._doAdd(child);
            }
        }

        return this;
    },
    remove: function (child) {
        var zr = this.__zr;
        var storage = this.__storage;
        var children = this._children;

        var idx = zrUtil.indexOf(children, child);
        if (idx < 0) {
            return this;
        }
        children.splice(idx, 1);

        child.parent = null;

        if (storage) {

            storage.delFromMap(child.id);

            if (child instanceof Group) {
                child.delChildrenFromStorage(storage);
            }
        }

        zr && zr.refresh();

        return this;
    }
};
zrUtil.inherits(Group, Element);
module.exports = Group;
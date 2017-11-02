/**
 * Created by JDR on 2017/8/22.
 */
define(function(require){
    //模型数据基本方法，管理options对象，通过options的对象名获取对象值
    //混合了lineStyle，areaStyle，textStyle,itemStyle方法用来管理与线，文本，项目有关的options属性
    var zrUtil = require('../tool/util');
    var clazzUtil = require("../tool/clazz");
    function Model(option, parentModel, ecModel) {
        this.parentModel = parentModel;
        this.ecModel = ecModel;
        this.option = option;
    }

    Model.prototype = {
        constructor: Model,
        init: null,
        mergeOption: function (option) {
            zrUtil.merge(this.option, option, true);
        },
        get: function (path, ignoreParent) {
            if (path == null) {
                return this.option;
            }

            return doGet(
                this.option,
                this.parsePath(path),
                !ignoreParent && getParent(this, path)
            );
        },
        getShallow: function (key, ignoreParent) {
            var option = this.option;

            var val = option == null ? option : option[key];
            var parentModel = !ignoreParent && getParent(this, key);
            if (val == null && parentModel) {
                val = parentModel.getShallow(key);
            }
            return val;
        },
        getModel: function (path, parentModel) {
            var obj = path == null
                ? this.option
                : doGet(this.option, path = this.parsePath(path));

            var thisParentModel;
            parentModel = parentModel || (
                    (thisParentModel = getParent(this, path))
                    && thisParentModel.getModel(path)
                );

            return new Model(obj, parentModel, this.ecModel);
        },
        isEmpty: function () {
            return this.option == null;
        },
        restoreData: function () {},
        clone: function () {
            var Ctor = this.constructor;
            return new Ctor(zrUtil.clone(this.option));
        },
        setReadOnly: function (properties) {
            clazzUtil.setReadOnly(this, properties);
        },
        parsePath: function(path) {
            if (typeof path === 'string') {
                path = path.split('.');
            }
            return path;
        },
        customizeGetParent: function (getParentMethod) {
            clazzUtil.set(this, 'getParent', getParentMethod);
        }
    };
    function doGet(obj, pathArr, parentModel) {
        for (var i = 0; i < pathArr.length; i++) {
            // Ignore empty
            if (!pathArr[i]) {
                continue;
            }
            // obj could be number/string/... (like 0)
            obj = (obj && typeof obj === 'object') ? obj[pathArr[i]] : null;
            if (obj == null) {
                break;
            }
        }
        if (obj == null && parentModel) {
            obj = parentModel.get(pathArr);
        }
        return obj;
    }

    function getParent(model, path) {
        var getParentMethod = clazzUtil.get(model, 'getParent');
        return getParentMethod ? getParentMethod.call(model, path) : model.parentModel;
    }

    // Enable Model.extend.
    clazzUtil.enableClassExtend(Model);

    var mixin = zrUtil.mixin;
    mixin(Model, require('./mixin/lineStyle'));
    mixin(Model, require('./mixin/areaStyle'));
    mixin(Model, require('./mixin/textStyle'));
    mixin(Model, require('./mixin/itemStyle'));

    return Model;
});
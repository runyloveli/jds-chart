/**
 * Created by JDR on 2017/8/30.
 */


var Group = require('../core/Group');
var componentUtil = require('../utility/component');
var clazzUtil = require('../utility/clazz');

var Component = function () {
    /**
     * @type {module:zrender/container/Group}
     * @readOnly
     */
    this.group = new Group();

    /**
     * @type {string}
     * @readOnly
     */
    this.uid = componentUtil.getUID('viewComponent');
};

Component.prototype = {

    constructor: Component,

    init: function (ecModel, api) {},

    render: function (componentModel, ecModel, api, payload) {},

    dispose: function () {}

};

var componentProto = Component.prototype;
componentProto.updateView
    = componentProto.updateLayout
    = componentProto.updateVisual
    = function (seriesModel, ecModel, api, payload) {
    // Do nothing;
};
// Enable Component.extend.
clazzUtil.enableClassExtend(Component);

// Enable capability of registerClass, getClass, hasClass, registerSubTypeDefaulter and so on.
clazzUtil.enableClassManagement(Component, {registerWhenExtend: true});

module.exports = Component;

/**
 * Created on 2017/8/14 for jdscharts.
 */
var jdscharts = {
    jdscharts: 1,
    version: '1.0.0',
    dependencies: {
        none: '0.0.0'
    }
};
var env = require("./tool/env");
var util = require("./tool/util");
var ExtensionAPI = require("./tool/ExtensionAPI");
var CoordinateSystemManager = require("./CoordinateSystem");
var OptionManager = require("./model/OptionManager");
var GlobalModel = require("./model/Global");

var ComponentModel = require('./model/Component');
var SeriesModel = require('./model/Series');
var ComponentView = require('./view/Component');
var ChartView = require('./view/Chart');
var modelUtil = require('./tool/model');
var parseClassType = ComponentModel.parseClassType;
var Eventful = require('./core/mixin/Eventful');
var timsort = require('./core/timsort');
var jrender = require("./core/jrender");
var Storage = require("./core/storage");
var instances = {};
var idBase = new Date() - 0;
var DOM_ATTRIBUTE_KEY = '_echarts_instance_';
var HAS_GRADIENT_OR_PATTERN_BG = '__hasGradientOrPatternBg';
var IN_MAIN_PROCESS = '__flagInMainProcess';
var OPTION_UPDATED = '__optionUpdated';
var ACTION_REG = /^[a-zA-Z0-9_]+$/;
var PRIORITY_PROCESSOR_FILTER = 1000;
var PRIORITY_PROCESSOR_STATISTIC = 5000;

var PRIORITY_VISUAL_LAYOUT = 1000;
var PRIORITY_VISUAL_GLOBAL = 2000;
var PRIORITY_VISUAL_CHART = 3000;
var PRIORITY_VISUAL_COMPONENT = 4000;
var PRIORITY_VISUAL_BRUSH = 5000;

//引入所需组件与图表
function createRegisterEventWithLowercaseName(method) {
    return function (eventName, handler, context) {
        // Event name is all lowercase
        eventName = eventName && eventName.toLowerCase();
        Eventful.prototype[method].call(this, eventName, handler, context);
    };
}
function MessageCenter() {
    Eventful.call(this);
}
MessageCenter.prototype.on = createRegisterEventWithLowercaseName('on');
MessageCenter.prototype.off = createRegisterEventWithLowercaseName('off');
MessageCenter.prototype.one = createRegisterEventWithLowercaseName('one');
util.mixin(MessageCenter, Eventful);
function JdsCharts (dom, opts) {
    opts = opts || {};
    this._dom = dom;
    var jr = this._jr = jrender.init(dom, {
        renderer: opts.renderer || 'canvas',
        devicePixelRatio: opts.devicePixelRatio,
        width: opts.width,
        height: opts.height
    });
    this._api = new ExtensionAPI(this);
    this._coordSysMgr = new CoordinateSystemManager();
    Eventful.call(this);
    this._messageCenter = new MessageCenter();
    this._initEvents();//初始化时间
    // In case some people write `window.onresize = chart.resize`
    this.resize = util.bind(this.resize, this);

    this._chartsViews = [];
    this._componentsViews = [];
    this._componentsMap = {};
    this._chartsMap = {};
    this._pendingActions = [];
    this._pendingActions = [];
    // Sort on demand
    function prioritySortFunc(a, b) {
        return a.prio - b.prio;
    }
    timsort(visualFuncs, prioritySortFunc);
    timsort(dataProcessorFuncs, prioritySortFunc);
}
var jdschartsProto = JdsCharts.prototype;
jdschartsProto.getZr = function () {
    return this._jr;
};
jdschartsProto.getDom = function () {
    return this._dom;
};
jdschartsProto.setOption = function (option) {
    this[IN_MAIN_PROCESS] = true;
    if(!this._model) {
        //optionManager设置，合并，解析options
        var optionManager = new OptionManager(this._api);
        var theme  = {};
        //ecModel，合并主题，component，charts的默认配置，拓展optionsManager方法，返回一个融合后的对象
        //包含拓展后的设置，合并options的方法，存储options
        var ecModel = this._model = new GlobalModel(null, null, theme, optionManager);
        //初始化ecModel，重定向
        ecModel.init(null, null, theme, optionManager);
    }
    //console.log("optionPreprocessorFuncs",optionPreprocessorFuncs);
    this._model.setOption(option);//重点 渲染
    //console.log("this", this);
    updateMethods.prepareAndUpdate.call(this);
    this._jr.flush();
    this[OPTION_UPDATED] = false;
    this[IN_MAIN_PROCESS] = false;
    flushPendingActions.call(this, false);
};
jdschartsProto.getOption = function () {
    return this._model && this._model.getOption();
};
jdschartsProto.getModel = function () {
    return this._model;
};
jdschartsProto.getOption = function () {
    return this._model && this._model.getOption();
};
jdschartsProto.getWidth = function () {};
jdschartsProto.getHeight = function () {};
jdschartsProto.getRenderedCanvas = function (opts) {
    if (!env.canvasSupported) {
        return;
    }
    opts = opts || {};
    opts.pixelRatio = opts.pixelRatio || 1;
    opts.backgroundColor = opts.backgroundColor
        || this._model.get('backgroundColor');
    var jr = this._jr;
    var list = jr.storage.getDisplayList();
    // Stop animations
    util.each(list, function (el) {
        el.stopAnimation(true);
    });
    return jr.painter.getRenderedCanvas(opts);
};
jdschartsProto.getDataURL = function (opts) {
    opts = opts || {};
    var excludeComponents = opts.excludeComponents;
    var ecModel = this._model;
    var excludesComponentViews = [];
    var self = this;

    each(excludeComponents, function (componentType) {
        ecModel.eachComponent({
            mainType: componentType
        }, function (component) {
            var view = self._componentsMap[component.__viewId];
            if (!view.group.ignore) {
                excludesComponentViews.push(view);
                view.group.ignore = true;
            }
        });
    });

    var url = this.getRenderedCanvas(opts).toDataURL(
        'image/' + (opts && opts.type || 'png')
    );

    each(excludesComponentViews, function (view) {
        view.group.ignore = false;
    });
    return url;
};
jdschartsProto.getConnectedDataURL = function (opts) {
    if (!env.canvasSupported) {
        return;
    }
    var groupId = this.group;
    var mathMin = Math.min;
    var mathMax = Math.max;
    var MAX_NUMBER = Infinity;
    if (connectedGroups[groupId]) {
        var left = MAX_NUMBER;
        var top = MAX_NUMBER;
        var right = -MAX_NUMBER;
        var bottom = -MAX_NUMBER;
        var canvasList = [];
        var dpr = (opts && opts.pixelRatio) || 1;

        util.each(instances, function (chart, id) {
            if (chart.group === groupId) {
                var canvas = chart.getRenderedCanvas(
                    util.clone(opts)
                );
                var boundingRect = chart.getDom().getBoundingClientRect();
                left = mathMin(boundingRect.left, left);
                top = mathMin(boundingRect.top, top);
                right = mathMax(boundingRect.right, right);
                bottom = mathMax(boundingRect.bottom, bottom);
                canvasList.push({
                    dom: canvas,
                    left: boundingRect.left,
                    top: boundingRect.top
                });
            }
        });

        left *= dpr;
        top *= dpr;
        right *= dpr;
        bottom *= dpr;
        var width = right - left;
        var height = bottom - top;
        var targetCanvas = util.createCanvas();
        targetCanvas.width = width;
        targetCanvas.height = height;
        var jr = jrender.init(targetCanvas);

        each(canvasList, function (item) {
            var img = new graphic.Image({
                style: {
                    x: item.left * dpr - left,
                    y: item.top * dpr - top,
                    image: item.dom
                }
            });
            jr.add(img);
        });
        jr.refreshImmediately();

        return targetCanvas.toDataURL('image/' + (opts && opts.type || 'png'));
    }
    else {
        return this.getDataURL(opts);
    }
};
jdschartsProto.convertToPixel = util.curry(doConvertPixel, 'convertToPixel');
jdschartsProto.convertFromPixel = util.curry(doConvertPixel, 'convertFromPixel');

function doConvertPixel(methodName, finder, value) {
    var ecModel = this._model;
    var coordSysList = this._coordSysMgr.getCoordinateSystems();
    var result;

    finder = modelUtil.parseFinder(ecModel, finder);

    for (var i = 0; i < coordSysList.length; i++) {
        var coordSys = coordSysList[i];
        if (coordSys[methodName]
            && (result = coordSys[methodName](ecModel, finder, value)) != null
        ) {
            return result;
        }
    }

    if (__DEV__) {
        console.warn(
            'No coordinate system that supports ' + methodName + ' found by the given finder.'
        );
    }
}
jdschartsProto.resize = function () {};
jdschartsProto.clear = function () {
    this.setOption({ series: [] }, true);
};
jdschartsProto.getVisual = function (finder, visualType) {
    var ecModel = this._model;

    finder = modelUtil.parseFinder(ecModel, finder, {defaultMainType: 'series'});

    var seriesModel = finder.seriesModel;

    if (__DEV__) {
        if (!seriesModel) {
            console.warn('There is no specified seires model');
        }
    }

    var data = seriesModel.getData();

    var dataIndexInside = finder.hasOwnProperty('dataIndexInside')
        ? finder.dataIndexInside
        : finder.hasOwnProperty('dataIndex')
        ? data.indexOfRawIndex(finder.dataIndex)
        : null;

    return dataIndexInside != null
        ? data.getItemVisual(dataIndexInside, visualType)
        : data.getVisual(visualType);
};
var updateMethods = {

    update: function (payload) {
        console.log('!!update start');
        console.time && console.time('update');
        var ecModel = this._model;
        var api = this._api;
        var coordSysMgr = this._coordSysMgr;
        var jr = this._jr;
        // update before setOption
        if (!ecModel) {
            return;
        }

        // Fixme First time update ?
        ecModel.restoreData();

        // TODO
        // Save total ecModel here for undo/redo (after restoring data and before processing data).
        // Undo (restoration of total ecModel) can be carried out in 'action' or outside API call.

        // Create new coordinate system each update
        // In LineView may save the old coordinate system and use it to get the orignal point
        coordSysMgr.create(this._model, this._api);

        processData.call(this, ecModel, api);

        stackSeriesData.call(this, ecModel);

        coordSysMgr.update(ecModel, api);

        doVisualEncoding.call(this, ecModel, payload);

        doRender.call(this, ecModel, payload);

        // Set background
        var backgroundColor = ecModel.get('backgroundColor') || 'transparent';

        var painter = jr.painter;
        console.log("this._model", this._model);
        if (painter.isSingleCanvas && painter.isSingleCanvas()) {
            jr.configLayer(0, {
                clearColor: backgroundColor
            });
        }
        else {
            // In IE8
            if (!env.canvasSupported) {
                var colorArr = colorTool.parse(backgroundColor);
                backgroundColor = colorTool.stringify(colorArr, 'rgb');
                if (colorArr[3] === 0) {
                    backgroundColor = 'transparent';
                }
            }
            if (backgroundColor.colorStops || backgroundColor.image) {
                // Gradient background
                // FIXME Fixed layer？
                jr.configLayer(0, {
                    clearColor: backgroundColor
                });
                this[HAS_GRADIENT_OR_PATTERN_BG] = true;

                this._dom.style.background = 'transparent';
            }
            else {
                if (this[HAS_GRADIENT_OR_PATTERN_BG]) {
                    jr.configLayer(0, {
                        clearColor: null
                    });
                }
                this[HAS_GRADIENT_OR_PATTERN_BG] = false;

                this._dom.style.background = backgroundColor;
            }
        }

        console.time && console.timeEnd('update');
    },

    /**
     * @param {Object} payload
     * @private
     */
    updateView: function (payload) {
        var ecModel = this._model;

        // update before setOption
        if (!ecModel) {
            return;
        }

        ecModel.eachSeries(function (seriesModel) {
            seriesModel.getData().clearAllVisual();
        });

        doVisualEncoding.call(this, ecModel, payload);

        invokeUpdateMethod.call(this, 'updateView', ecModel, payload);
    },

    /**
     * @param {Object} payload
     * @private
     */
    updateVisual: function (payload) {
        var ecModel = this._model;

        // update before setOption
        if (!ecModel) {
            return;
        }

        ecModel.eachSeries(function (seriesModel) {
            seriesModel.getData().clearAllVisual();
        });

        doVisualEncoding.call(this, ecModel, payload, true);

        invokeUpdateMethod.call(this, 'updateVisual', ecModel, payload);
    },

    /**
     * @param {Object} payload
     * @private
     */
    updateLayout: function (payload) {
        var ecModel = this._model;

        // update before setOption
        if (!ecModel) {
            return;
        }

        doLayout.call(this, ecModel, payload);

        invokeUpdateMethod.call(this, 'updateLayout', ecModel, payload);
    },

    /**
     * @param {Object} payload
     * @private
     */
    prepareAndUpdate: function (payload) {
        var ecModel = this._model;

        prepareView.call(this, 'component', ecModel);

        prepareView.call(this, 'chart', ecModel);

        // FIXME
        // ugly
        if (this.__lastOnlyGraphic) {//设置了graphic属性
            each(this._componentsViews, function (componentView) {
                var componentModel = componentView.__model;
                if (componentModel && componentModel.mainType === 'graphic') {
                    componentView.render(componentModel, ecModel, this._api, payload);
                    updateZ(componentModel, componentView);
                }
            }, this);
            this.__lastOnlyGraphic = false;
        }
        else {
            updateMethods.update.call(this, payload);
        }
    }
};
function updateDirectly(ecIns, method, payload, mainType, subType) {
    var ecModel = ecIns._model;
    var query = {};
    query[mainType + 'Id'] = payload[mainType + 'Id'];
    query[mainType + 'Index'] = payload[mainType + 'Index'];
    query[mainType + 'Name'] = payload[mainType + 'Name'];

    var condition = {mainType: mainType, query: query};
    subType && (condition.subType = subType); // subType may be '' by parseClassType;

    // If dispatchAction before setOption, do nothing.
    ecModel && ecModel.eachComponent(condition, function (model, index) {
        var view = ecIns[
            mainType === 'series' ? '_chartsMap' : '_componentsMap'
            ][model.__viewId];
        if (view && view.__alive) {
            view[method](model, ecModel, ecIns._api, payload);
        }
    }, ecIns);
}
jdschartsProto.dispatchAction = function (payload, opt) {
    if (!util.isObject(opt)) {
        opt = {silent: !!opt};
    }

    if (!actions[payload.type]) {
        return;
    }

    // if (__DEV__) {
    //     zrUtil.assert(
    //         !this[IN_MAIN_PROCESS],
    //         '`dispatchAction` should not be called during main process.'
    //         + 'unless updateMathod is "none".'
    //     );
    // }

    // May dispatchAction in rendering procedure
    if (this[IN_MAIN_PROCESS]) {
        this._pendingActions.push(payload);
        return;
    }

    doDispatchAction.call(this, payload, opt.silent);

    if (opt.flush) {
        this._jr.flush(true);
    }
    else if (opt.flush !== false && env.browser.weChat) {
        // In WeChat embeded browser, `requestAnimationFrame` and `setInterval`
        // hang when sliding page (on touch event), which cause that zr does not
        // refresh util user interaction finished, which is not expected.
        // But `dispatchAction` may be called too frequently when pan on touch
        // screen, which impacts performance if do not throttle them.
        this._throttledZrFlush();
    }

    flushPendingActions.call(this, opt.silent);
};
function doDispatchAction(payload, silent) {
    var payloadType = payload.type;
    var actionWrap = actions[payloadType];
    var actionInfo = actionWrap.actionInfo;

    var cptType = (actionInfo.update || 'update').split(':');
    var updateMethod = cptType.pop();
    cptType = cptType[0] && parseClassType(cptType[0]);

    this[IN_MAIN_PROCESS] = true;

    var payloads = [payload];
    var batched = false;
    // Batch action
    if (payload.batch) {
        batched = true;
        payloads = util.map(payload.batch, function (item) {
            item = util.defaults(util.extend({}, item), payload);
            item.batch = null;
            return item;
        });
    }

    var eventObjBatch = [];
    var eventObj;
    var isHighDown = payloadType === 'highlight' || payloadType === 'downplay';

    for (var i = 0; i < payloads.length; i++) {
        var batchItem = payloads[i];
        // Action can specify the event by return it.
        eventObj = actionWrap.action(batchItem, this._model);
        // Emit event outside
        eventObj = eventObj || util.extend({}, batchItem);
        // Convert type to eventType
        eventObj.type = actionInfo.event || eventObj.type;
        eventObjBatch.push(eventObj);

        // light update does not perform data process, layout and visual.
        if (isHighDown) {
            // method, payload, mainType, subType
            updateDirectly(this, updateMethod, batchItem, 'series');
        }
        else if (cptType) {
            updateDirectly(this, updateMethod, batchItem, cptType.main, cptType.sub);
        }
    }

    if (updateMethod !== 'none' && !isHighDown && !cptType) {
        // Still dirty
        if (this[OPTION_UPDATED]) {
            // FIXME Pass payload ?
            updateMethods.prepareAndUpdate.call(this, payload);
            this[OPTION_UPDATED] = false;
        }
        else {
            updateMethods[updateMethod].call(this, payload);
        }
    }

    // Follow the rule of action batch
    if (batched) {
        eventObj = {
            type: actionInfo.event || payloadType,
            batch: eventObjBatch
        };
    }
    else {
        eventObj = eventObjBatch[0];
    }

    this[IN_MAIN_PROCESS] = false;

    !silent && this._messageCenter.trigger(eventObj.type, eventObj);
}

function flushPendingActions(silent) {
    var pendingActions = this._pendingActions;
    while (pendingActions.length) {
        var payload = pendingActions.shift();
        doDispatchAction.call(this, payload, silent);
    }
}
function prepareView(type, ecModel) {
    var isComponent = type === 'component';
    var viewList = isComponent ? this._componentsViews : this._chartsViews;
    var viewMap = isComponent ? this._componentsMap : this._chartsMap;
    var jr = this._jr;

    for (var i = 0; i < viewList.length; i++) {
        viewList[i].__alive = false;
    }

    ecModel[isComponent ? 'eachComponent' : 'eachSeries'](function (componentType, model) {
        if (isComponent) {
            if (componentType === 'series') {
                return;
            }
        }
        else {
            model = componentType;
        }
        // Consider: id same and type changed.
        var viewId = model.id + '_' + model.type;
        var view = viewMap[viewId];
        if (!view) {
            var classType = parseClassType(model.type);
            var Clazz = isComponent
                ? ComponentView.getClass(classType.main, classType.sub)
                : ChartView.getClass(classType.sub);
            if (Clazz) {
                view = new Clazz();
                view.init(ecModel, this._api);
                viewMap[viewId] = view;
                viewList.push(view);
                jr.add(view.group);
            }
            else {
                // Error
                return;
            }
        }
        model.__viewId = viewId;
        view.__alive = true;
        view.__id = viewId;
        view.__model = model;
    }, this);

    for (var i = 0; i < viewList.length;) {
        var view = viewList[i];
        if (!view.__alive) {
            jr.remove(view.group);
            view.dispose(ecModel, this._api);
            viewList.splice(i, 1);
            delete viewMap[view.__id];
        }
        else {
            i++;
        }
    }
}
function processData(ecModel, api) {
    util.each(dataProcessorFuncs, function (process) {
        process.func(ecModel, api);
    });
}
function stackSeriesData(ecModel) {
    var stackedDataMap = {};
    ecModel.eachSeries(function (series) {
        var stack = series.get('stack');
        var data = series.getData();
        if (stack && data.type === 'list') {
            var previousStack = stackedDataMap[stack];
            if (previousStack) {
                data.stackedOn = previousStack;
            }
            stackedDataMap[stack] = data;
        }
    });
}
function doVisualEncoding(ecModel, payload, excludesLayout) {
    var api = this._api;
    ecModel.clearColorPalette();
    ecModel.eachSeries(function (seriesModel) {
        seriesModel.clearColorPalette();
    });
    util.each(visualFuncs, function (visual) {
        (!excludesLayout || !visual.isLayout)
        && visual.func(ecModel, api, payload);
    });
}
function doRender(ecModel, payload) {
    var api = this._api;
    // Render all components 渲染所有的配置组件,例如title,grid,toolbox,tooltip等
    util.each(this._componentsViews, function (componentView) {
        var componentModel = componentView.__model;
        console.info("componentModel:",componentModel);
        componentView.render(componentModel, ecModel, api, payload);
        //在componentModal文件夹下调用相应的render方法
        updateZ(componentModel, componentView);
    }, this);

    util.each(this._chartsViews, function (chart) {
        chart.__alive = false;
    }, this);

    // Render all charts 渲染所有的charts
    ecModel.eachSeries(function (seriesModel, idx) {
        var chartView = this._chartsMap[seriesModel.__viewId];//this._chartsMap
        chartView.__alive = true;
        console.info("chartView:",chartView);

        chartView.render(seriesModel, ecModel, api, payload);

        chartView.group.silent = !!seriesModel.get('silent');

        updateZ(seriesModel, chartView);

        updateProgressiveAndBlend(seriesModel, chartView);

    }, this);

    // If use hover layer 如果使用hover，更新hover层
    updateHoverLayerStatus(this._jr, ecModel);

    // Remove groups of unrendered charts
    util.each(this._chartsViews, function (chart) {
        if (!chart.__alive) {
            chart.remove(ecModel, api);
        }
    }, this);
}
var MOUSE_EVENT_NAMES = [
    'click', 'dblclick', 'mouseover', 'mouseout', 'mousemove',
    'mousedown', 'mouseup', 'globalout', 'contextmenu'
];
jdschartsProto._initEvents = function () {
    util.each(MOUSE_EVENT_NAMES, function (eveName) {
        this._jr.on(eveName, function (e) {
            var ecModel = this.getModel();
            var el = e.target;
            var params;

            // no e.target when 'globalout'.
            if (eveName === 'globalout') {
                params = {};
            }
            else if (el && el.dataIndex != null) {
                var dataModel = el.dataModel || ecModel.getSeriesByIndex(el.seriesIndex);
                params = dataModel && dataModel.getDataParams(el.dataIndex, el.dataType) || {};
            }
            // If element has custom eventData of components
            else if (el && el.eventData) {
                params = util.extend({}, el.eventData);
            }

            if (params) {
                params.event = e;
                params.type = eveName;
                this.trigger(eveName, params);
            }

        }, this);
    }, this);

    util.each(eventActionMap, function (actionType, eventType) {
        this._messageCenter.on(eventType, function (event) {
            this.trigger(eventType, event);
        }, this);
    }, this);
};
function updateProgressiveAndBlend(seriesModel, chartView) {
    // Progressive configuration
    var elCount = 0;
    chartView.group.traverse(function (el) {
        if (el.type !== 'group' && !el.ignore) {
            elCount++;
        }
    });
    var frameDrawNum = +seriesModel.get('progressive');
    var needProgressive = elCount > seriesModel.get('progressiveThreshold') && frameDrawNum && !env.node;
    if (needProgressive) {
        chartView.group.traverse(function (el) {
            // FIXME marker and other components
            if (!el.isGroup) {
                el.progressive = needProgressive ?
                    Math.floor(elCount++ / frameDrawNum) : -1;
                if (needProgressive) {
                    el.stopAnimation(true);
                }
            }
        });
    }

    // Blend configration
    var blendMode = seriesModel.get('blendMode') || null;
    if (__DEV__) {
        if (!env.canvasSupported && blendMode && blendMode !== 'source-over') {
            console.warn('Only canvas support blendMode');
        }
    }
    chartView.group.traverse(function (el) {
        // FIXME marker and other components
        if (!el.isGroup) {
            el.setStyle('blend', blendMode);
        }
    });
}
function updateZ(model, view) {
    var z = model.get('z');
    var zlevel = model.get('zlevel');
    // Set z and zlevel
    view.group.traverse(function (el) {
        if (el.type !== 'group') {
            z != null && (el.z = z);
            zlevel != null && (el.zlevel = zlevel);
        }
    });
}
var actions = [];
var eventActionMap = {};
var loadingEffects = {};
var dataProcessorFuncs = [];
var visualFuncs = [];
var optionPreprocessorFuncs = [];
//按照顺序更新状态
function enableConnect(chart) {
    //一共三种状态
    var STATUS_PENDING = 0;
    var STATUS_UPDATING = 1;
    var STATUS_UPDATED = 2;
    var STATUS_KEY = '__connectUpdateStatus';
    function updateConnectedChartsStatus(charts, status) {//更新状态
        for (var i = 0; i < charts.length; i++) {
            var otherChart = charts[i];
            otherChart[STATUS_KEY] = status;
        }
    }
    console.log("eventActionMap:",eventActionMap);
    util.each(eventActionMap, function (actionType, eventType) {
        chart._messageCenter.on(eventType, function (event) {
            if (connectedGroups[chart.group] && chart[STATUS_KEY] !== STATUS_PENDING) {
                var action = chart.makeActionFromEvent(event);
                var otherCharts = [];

                util.each(instances, function (otherChart) {
                    if (otherChart !== chart && otherChart.group === chart.group) {
                        otherCharts.push(otherChart);
                    }
                });

                updateConnectedChartsStatus(otherCharts, STATUS_PENDING);//状态0
                util.each(otherCharts, function (otherChart) {
                    if (otherChart[STATUS_KEY] !== STATUS_UPDATING) {//状态1
                        otherChart.dispatchAction(action);
                    }
                });
                updateConnectedChartsStatus(otherCharts, STATUS_UPDATED);//状态2
            }
        });
    });

}
//初始化实例
jdscharts.init = function (dom, opts) {
    if (!dom) {
        throw new Error('invalid dom');
    }
    if (!dom.clientWidth || !dom.clientHeight) {
        console.warn('Can\'t get dom width or height');
    }
    var chart = new JdsCharts(dom, opts);
    chart.id = 'ec_' + idBase++;
    instances[chart.id] = chart;
    dom.setAttribute && dom.setAttribute(DOM_ATTRIBUTE_KEY, chart.id);
    enableConnect(chart);//按照顺序更新状态，一共三个状态
    return chart;
};
jdscharts.connect = function (groupId) {
    // Is array of charts
    if (util.isArray(groupId)) {
        var charts = groupId;
        groupId = null;
        // If any chart has group
        util.each(charts, function (chart) {
            if (chart.group != null) {
                groupId = chart.group;
            }
        });
        groupId = groupId || ('g_' + groupIdBase++);
        util.each(charts, function (chart) {
            chart.group = groupId;
        });
    }
    connectedGroups[groupId] = true;
    return groupId;
};
//销毁实例
jdscharts.dispose = function () {};
//获取dom容器上的实例
jdscharts.getInstanceByDom = function () {};
jdscharts.registerAction = function (actionInfo, eventName, action) {
    if (typeof eventName === 'function') {
        action = eventName;
        eventName = '';
    }
    var actionType = util.isObject(actionInfo)
        ? actionInfo.type
        : ([actionInfo, actionInfo = {
        event: eventName
    }][0]);

    // Event name is all lowercase
    actionInfo.event = (actionInfo.event || actionType).toLowerCase();
    eventName = actionInfo.event;

    // Validate action type and event name.
    util.assert(ACTION_REG.test(actionType) && ACTION_REG.test(eventName));

    if (!actions[actionType]) {
        actions[actionType] = {action: action, actionInfo: actionInfo};
    }
    eventActionMap[eventName] = actionType;
};
jdscharts.registerCoordinateSystem = function (type, CoordinateSystem) {
    CoordinateSystemManager.register(type, CoordinateSystem);
};
jdscharts.registerPreprocessor = function (preprocessorFunc) {
    optionPreprocessorFuncs.push(preprocessorFunc);
};
jdscharts.registerLoading = function (name, loadingFx) {
    loadingEffects[name] = loadingFx;
};
jdscharts.registerProcessor = function (priority, processorFunc) {
    if (typeof priority === 'function') {
        processorFunc = priority;
        priority = PRIORITY_PROCESSOR_FILTER;
    }
    if (__DEV__) {
        if (isNaN(priority)) {
            throw new Error('Unkown processor priority');
        }
    }
    dataProcessorFuncs.push({
        prio: priority,
        func: processorFunc
    });
};
jdscharts.registerLayout = function (priority, layoutFunc) {
    if (typeof priority === 'function') {
        layoutFunc = priority;
        priority = PRIORITY_VISUAL_LAYOUT;
    }
    if (__DEV__) {
        if (isNaN(priority)) {
            throw new Error('Unkown layout priority');
        }
    }
    visualFuncs.push({
        prio: priority,
        func: layoutFunc,
        isLayout: true
    });
};
jdscharts.registerVisual = function (priority, visualFunc) {
    if (typeof priority === 'function') {
        visualFunc = priority;
        priority = PRIORITY_VISUAL_CHART;
    }
    if (__DEV__) {
        if (isNaN(priority)) {
            throw new Error('Unkown visual priority');
        }
    }
    visualFuncs.push({
        prio: priority,
        func: visualFunc
    });
};
//讲分离的并需要引入的组件，图表，Series合并。
jdscharts.extendComponentView = function (opts/*, superClass*/) {
    // var Clazz = ComponentView;
    // if (superClass) {
    //     var classType = parseClassType(superClass);
    //     Clazz = ComponentView.getClass(classType.main, classType.sub, true);
    // }
    return ComponentView.extend(opts);
};
jdscharts.extendSeriesModel = function (opts/*, superClass*/) {
    // var Clazz = SeriesModel;
    // if (superClass) {
    //     superClass = 'series.' + superClass.replace('series.', '');
    //     var classType = parseClassType(superClass);
    //     Clazz = ComponentModel.getClass(classType.main, classType.sub, true);
    // }
    return SeriesModel.extend(opts);
};
jdscharts.extendChartView = function (opts/*, superClass*/) {
    // var Clazz = ChartView;
    // if (superClass) {
    //     superClass = superClass.replace('series.', '');
    //     var classType = parseClassType(superClass);
    //     Clazz = ChartView.getClass(classType.main, true);
    // }
    return ChartView.extend(opts);
};
jdscharts.setCanvasCreator = function (creator) {
    util.createCanvas = creator;
};
jdscharts.registerVisual(PRIORITY_VISUAL_GLOBAL, require('./visual/seriesColor'));
jdscharts.registerPreprocessor(require('./preprocessor/backwardCompat'));
jdscharts.registerLoading('default', require('./loading/default'));
function updateHoverLayerStatus(jr, ecModel) {
    var storage = jr.storage;
    var elCount = 0;
    storage.traverse(function (el) {
        if (!el.isGroup) {
            elCount++;
        }
    });
    if (elCount > ecModel.get('hoverLayerThreshold') && !env.node) {
        storage.traverse(function (el) {
            if (!el.isGroup) {
                el.useHoverLayer = true;
            }
        });
    }
}
// Default action
jdscharts.registerAction({
    type: 'highlight',
    event: 'highlight',
    update: 'highlight'
}, util.noop);
jdscharts.registerAction({
    type: 'downplay',
    event: 'downplay',
    update: 'downplay'
}, util.noop);
// PRIORITY
jdscharts.PRIORITY = {
    PROCESSOR: {
        FILTER: PRIORITY_PROCESSOR_FILTER,
        STATISTIC: PRIORITY_PROCESSOR_STATISTIC
    },
    VISUAL: {
        LAYOUT: PRIORITY_VISUAL_LAYOUT,
        GLOBAL: PRIORITY_VISUAL_GLOBAL,
        CHART: PRIORITY_VISUAL_CHART,
        COMPONENT: PRIORITY_VISUAL_COMPONENT,
        BRUSH: PRIORITY_VISUAL_BRUSH
    }
};
//console.log(jdscharts);
module.exports = jdscharts;
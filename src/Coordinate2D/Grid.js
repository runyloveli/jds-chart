/**
 * Created by JDR on 2017/9/4.
 */
var Cartesian = require('./Cartesian');
var Axis2D = require('./Axis2D');
var gridModel = {
    type: 'grid',
    dependencies: ['xAxis', 'yAxis'],
    layoutMode: 'box',
    coordinateSystem: null,
    defaultOption: {
        show: false,
        zlevel: 0,
        z: 0,
        left: '10%',
        top: 60,
        right: '10%',
        bottom: 60,
        // If grid size contain label
        containLabel: false,
        // width: {totalWidth} - left - right,
        // height: {totalHeight} - top - bottom,
        backgroundColor: 'rgba(0,0,0,0)',
        borderWidth: 1,
        borderColor: '#ccc'
    }
};
function Grid(gridModel) {
    this._coordsMap = {};
    this._coordsList = [];
    this._axesMap = {};
    this._axesList = [];
    this._initCartesian(gridModel);
    this._model = gridModel;
}
Grid.prototype.type = 'grid';
Grid.prototype.update = function () {
    var axesMap = this._axesMap;
    this._updateScale();//调整比例
};
Grid.prototype._initCartesian = function(gridModel) {
    var self = this;
    var axisPositionUsed = {
        left: false,
        right: false,
        top: false,
        bottom: false
    };
    var axesMap = {
        x: {},
        y: {}
    };
    var axesCount = {
        x: 0,
        y: 0
    };
    this._axesMap = {};
    this._axesList = [];
    //if (!axesCount.x || !axesCount.y) {
    //    this._axesMap = {};
    //    this._axesList = [];
    //    return;
    //}
    createAxisCreator('x');
    createAxisCreator('y');
    //Create axis
    //实例化坐标系，相应添加XY轴
    this._axesMap = axesMap;
    var key = 'x0y0';
    var cartesian = new Cartesian(key);
    cartesian.grid = this;
    this._coordsMap[key] = cartesian;
    this._coordsList.push(cartesian);
    //cartesian.addAxis(xAxis);
    //cartesian.addAxis(yAxis);
    function createAxisCreator(axisType) {
        //console.log('创造X或Y轴');
        //var axisPosition = axisModel.get('position');
        var axis = new Axis2D(
            axisType, {},
            [0, 0],
            'type',
            'top'
        );
        self._axesList.push(axis);
        axesMap[axisType]['0'] = axis;
        axesCount[axisType]++;
    }
};
Grid.prototype.resize = function() {};
Grid.prototype._updateScale = function () {};
Grid.create = function() {
    var grids = [];
    var grid = new Grid(gridModel);
    grid.name = 'grid_01';
    grid.resize();
    grids.push(grid);
    return grid;
};
module.exports = Grid;
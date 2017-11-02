/**
 * Created by JDR on 2017/9/7.
 */
var zrUtil = require('../core/util');
function dimAxisMapper(dim) {
    return this._axes[dim];
}
var Cartesian = function (name) {
    this._axes = {};
    this._dimList = [];
    this.name = name || '';
};
Cartesian.prototype = {
    constructor: Cartesian,
    type: 'cartesian2D',
    dimensions: ['x', 'y'],
    getAxis: function (dim) {
        return this._axes[dim];
    },
    getAxes: function () {
        return zrUtil.map(this._dimList, dimAxisMapper, this);
    },
    getAxesByScale: function (scaleType) {
        scaleType = scaleType.toLowerCase();
        return zrUtil.filter(
            this.getAxes(),
            function (axis) {
                return axis.scale.type === scaleType;
            }
        );
    },
    addAxis: function (axis) {
        var dim = axis.dim;

        this._axes[dim] = axis;

        this._dimList.push(dim);
    },
    dataToCoord: function (val) {
        return this._dataCoordConvert(val, 'dataToCoord');
    },
    coordToData: function (val) {
        return this._dataCoordConvert(val, 'coordToData');
    },
    _dataCoordConvert: function (input, method) {
        var dimList = this._dimList;

        var output = input instanceof Array ? [] : {};

        for (var i = 0; i < dimList.length; i++) {
            var dim = dimList[i];
            var axis = this._axes[dim];

            output[dim] = axis[method](input[dim]);
        }

        return output;
    },
    getBaseAxis: function () {
        return this.getAxesByScale('ordinal')[0]
            || this.getAxesByScale('time')[0]
            || this.getAxis('x');
    },
    containPoint: function (point) {
        var axisX = this.getAxis('x');
        var axisY = this.getAxis('y');
        return axisX.contain(axisX.toLocalCoord(point[0]))
            && axisY.contain(axisY.toLocalCoord(point[1]));
    },
    containData: function (data) {
        return this.getAxis('x').containData(data[0])
            && this.getAxis('y').containData(data[1]);
    },
    dataToPoints: function (data, stack) {
        return data.mapArray(['x', 'y'], function (x, y) {
            return this.dataToPoint([x, y]);
        }, stack, this);
    },
    dataToPoint: function (data, clamp) {
        var xAxis = this.getAxis('x');
        var yAxis = this.getAxis('y');
        return [
            xAxis.toGlobalCoord(xAxis.dataToCoord(data[0], clamp)),
            yAxis.toGlobalCoord(yAxis.dataToCoord(data[1], clamp))
        ];
    },
    pointToData: function (point, clamp) {
        var xAxis = this.getAxis('x');
        var yAxis = this.getAxis('y');
        return [
            xAxis.coordToData(xAxis.toLocalCoord(point[0]), clamp),
            yAxis.coordToData(yAxis.toLocalCoord(point[1]), clamp)
        ];
    },
    getOtherAxis: function (axis) {
        return this.getAxis(axis.dim === 'x' ? 'y' : 'x');
    }
};
module.exports = Cartesian;
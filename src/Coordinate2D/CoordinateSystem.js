/**
 * Created by JDR on 2017/9/6.
 */

var grid = require("./Grid");
var coordinateSystemCreators = {};
function CoordinateSystemManager() {

    this._coordinateSystems = [];
}
CoordinateSystemManager.prototype = {
    constructor: CoordinateSystemManager,
    create: function() {
        var coordinateSystems = [];
        var gridList = grid.create();
        this._coordinateSystems = coordinateSystems.concat(gridList || []);
    },
    update: function() {
        //console.log("this._coordinateSystems",this._coordinateSystems);
        var coordSys = this._coordinateSystems;
        //coordSys[0].update && coordSys[0].update();
        coordSys[0].update();
    }
};
//CoordinateSystemManager.register = function (type, coordinateSyetemCreator) {
//    coordinateSyetemCreators[type] = coordinateSyetemCreator;
//};
module.exports = CoordinateSystemManager;
//line 
var zrUtil = require('../tool/util');
var jdscharts = require('../jdscharts');
var PRIORITY = jdscharts.PRIORITY;

require('./line/LineSeries');
require('./line/LineView');
console.log(jdscharts);
jdscharts.registerVisual(zrUtil.curry(
    require('../visual/symbol'), 'line', 'circle', 'line'
));
jdscharts.registerLayout(zrUtil.curry(
    require('../layout/points'), 'line'
));

// Down sample after filter
jdscharts.registerProcessor(PRIORITY.PROCESSOR.STATISTIC, zrUtil.curry(
    require('../processor/dataSample'), 'line'
));

// In case developer forget to include grid component
require('../component/grid');





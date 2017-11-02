/**
 * Created by JDR on 2017/8/15.
 */
define(function(require,exports) {
    var data = require("data").data;
    require("../jdscharts/build/jdscharts");
    //require("../jdscharts/src/component/tooltip");
    //require("../jdscharts/src/component/title");
    //require("../jdscharts/src/component/datazoom");
    //require("../jdscharts/src/chart/line");
    //require("../jdscharts/src/chart/candlestick");
    window.charts = {
        options: {},
        state: {},
        init: function () {
            this.bindEvent();
            this.initOptions();
            this.initChart();
        },
        bindEvent: function() {
            var self = this;
            document.getElementById('start').onclick = function(){
                self.initOptions();
                self.initChart();
            };
        },
        initOptions: function () {
            this.options = this.setKlineOptions(data);
        },
        initChart: function () {
            var mychart = jdscharts.init(document.getElementById('kline'));
            mychart.setOption(this.options);
        },
        setKlineOptions: function (data) {
            return {
                //animation:false,
                grid: {   //直角坐标系内绘图网格
                    left: '13%',//组件离容器左侧的距离。
                    right:'11%',
                    top:'6%',
                },
                xAxis: {
                    type: 'category',
                    data: ['123','123','123','123','123','123','123','123','123'],
                    position: 'bottom'
                },
                yAxis: {
                    type: 'value',
                    axisPointer:{
                        show:false
                    },
                    scale: true,
                    nameGap: 20,
                    nameTextStyle: {
                        color: '#000000',
                        fontWeight: 'bold',
                        fontSize: 30
                    },
                    position: 'left'

                },
                series : {
                    name: 'kaishi',
                    type: 'line',
                    lineStyle: {
                        normal: {
                            width: 4,
                            color: '#78C3FF'
                        }
                    },
                    data:['123','123','123','123','123','123','123','123']
                }
            }
        }
    };
    exports.charts = charts ;
});

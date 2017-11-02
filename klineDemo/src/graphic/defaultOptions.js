/**
 * Created by JDR on 2017/9/18.
 */
var defaultOption = {
    //type:1折线图，2K线图，3折线+K线图，默认折线图
    type: 1,
    animation: false,
    title: {
        show: true,
        text: '',
        link: '',
        Color: '#333',
        Fontsize: '18px',
        textAlign: 'center',
        VerticalAlign: 'middle',
        BorderColor: 'transparent',
        Zlevel: 0,
        z: 2
    },
    legend: {},
    grid: {
        show: true,
        zlevel: 0,
        z: 2,
        rowNum: 5,
        coloumNum: 4,
        borderColor: "#ced4db",
        borderWidth: 1,
        backgroundColor: '#f22',
        left: 0,
        right: 0,
        top: 0,
        bottom:0
    },
    xAxis:{
        show: false,
        zlevel: 0,
        z: 0,
        font: '10px Helvetica',
        color: '#2e3033',
        width: 90,
        region: {
            x: 4.5,
            y: 245,
            width: 362
        },
        splitNumber: 3,
        axisLine: {},
        axisTick: {},
        axisLabel: {
            showMaxLabel: true,
            textStyle: {
                color: '#000',
                fontSize: 24
            },
            formatter: function (value) {
                return format(new Date(value), "MM/dd");
            }
        }
    },
    yAxis:{
        show: false,
        zlevel: 0,
        z: 0,
        axisLine: {},
        axisTick: {},
        axisLabel: {}
    },
    dataZoom: {},
    toolTip: {},
    axisPointer: {},
    graphic: {},
    series: [//数组第一个元素默认折线图，第二个默认K线图
        {
            type: 'line',
            name: '',
            data: [],
            zlevel: 0,
            z: 2
        },
        {
            type: 'candlestick',
            name: '',
            data: [],
            barWidth: 0,
            barMinWidth: 0,
            barMaxWidth: 0,
            dimensions: ['date','open','close','highest','lowest'],//给data中每个维度赋予名称
            zlevel: 0,
            z: 2
        }
    ],
    zlevel: 0,
    z: 2,
    coordinateSystem: 'cartesian2d',
    layout: null,
    itemStyle: {
        normal: {
            color: '#c23531', // 阳线 positive
                color0: '#314656', // 阴线 negative     '#c23531', '#314656'
                borderWidth: 1,
                borderColor: '#c23531',
                borderColor0: '#314656'
        },
        emphasis: {
            borderWidth: 2
        }
    },
    barMaxWidth: null,
    barMinWidth: null,
    barWidth: null
};
module.exports = defaultOption;
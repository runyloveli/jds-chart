/**
 * Created by JDR on 2017/9/15.
 */
function abc() {
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                axisPointer: {
                    lineStyle:{
                        type: 'solid',
                        color: '#b2b5c1'
                    }
                }
            },
            textStyle: {
                fontWeight: 'bold',
                fontSize: 36
            },
            padding: [5, 10],
            confine: true,//限制图标区域内
        },
        dataZoom:[
            {
                type:'inside'
            }
        ],
        xAxis: {
            type: 'category',
            //data: klineTransData.xcategory,
            //data: klinedata.categoryData,
            data: klineTransData.xTime,
            scale: true,
            boundaryGap : false,
            axisLabel: {
                showMaxLable: true,
                textStyle: {
                    //color: '#000000',
                    fontSize: 24
                },
                formatter: function (value) {
                    return format(new Date(value), "MM/dd");
                }
            },
            axisTick:{
                inside:true
            },
            axisPointer:{
                label:{
                    show:false
                }
            },
            axisLine: {
                onZero: false,
                lineStyle: {
                    color: '#000'
                }
            },
            margin:15,
            splitLine: {show: false},
            splitNumber: 3
        },
        yAxis: [
            {
                type: 'value',
                axisPointer:{
                    show:false
                },
                max:profitmax,
                min:-1*profitmax,
                interval:profitmax/2,
                scale: true,
                nameGap: 20,
                nameTextStyle: {
                    color: '#000000',
                    fontWeight: 'bold',
                    fontSize: 30
                },
                // splitNumber:3,
                axisLabel: {
                    textStyle: {
                        color: '#000000',
                        // fontWeight: 'bold',
                        fontSize: 22
                    },
                    formatter: function (val,index) {
                        if(isflag){
                            return val==0?0:val/10000+'w'
                        }else{
                            return val
                        }
                    }
                },
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: '#1386e4'
                    },
                    show: false
                },
                axisTick: {
                    show: false
                },
                position: 'left',

            },
            {
                type: 'value',
                max:krightmax,
                min:krightmin,
                interval:kfen,
                axisPointer:{
                    show:false
                },
                scale: true,
                nameGap: 20,
                nameTextStyle: {
                    color: '#000000',
                    fontWeight: 'bold',
                    fontSize: 32
                },
                splitNumber:4,
                axisLabel: {
                    formatter: '{value}',
                    textStyle: {
                        color: '#000000',
                        // fontWeight: 'bold',
                        fontSize: 22
                    }
                },
                axisLine: {
                    onZero: false,
                    show: false,
                    lineStyle: {
                        color: '#1386e4'
                    }
                },
                axisTick: {
                    show: false
                },
                position: 'right'
            },
            {
                type: 'value',
                axisPointer:{
                    show:false
                },
                min: 0,
                max: fmax,
                interval:fenge,
                position: 'right',
                axisLabel: {
                    textStyle: {
                        color: '#000000',
                        // fontWeight: 'bold',
                        fontSize: 24
                    }
                },
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: '#1386e4'
                    },
                    show: false
                },
                axisTick: {
                    show: false
                },
            }
        ],
        series : [
            {
                name: '盈亏',
                type: 'line',
                smooth: true,
                z: 3,
                symbolSize:0,
                lineStyle: {
                    normal: {
                        width: 4,
                        color: '#78C3FF',
                    }
                },
                data:klineTransData.profit2
            },
            {
                name:'日K',
                type:'k',
                data:klinedata.values,
                yAxisIndex: 1,
                z:3,
                barMaxWidth: '20%',
                itemStyle: {
                    normal: {
                        color: 'white',
                        color0: '#1dbf60',
                        borderColor: 'red',
                        borderColor0:'green',
                        borderWidth:3,
                    }
                }
            },
            {
                name: '交易频率',
                type: 'line',
                z:3,
                show:true,
                smooth: true,
                //label: {
                //  normal: {
                //    show: true,
                //    position: 'top'
                //  }
                //},
                symbolSize:0,
                yAxisIndex: 2,
                lineStyle: {
                    normal: {
                        width: 4,
                        color: '#FFB356',
                    }
                },
                data:frearrdata
            },
            {
                name: '扛单值',
                type: 'scatter',
                z:4,
                yAxisIndex: 0,
                symbol:'diamond',
                itemStyle: {
                    normal:{
                        color:'#ff3600',
                        borderColor:'#ff3600',
                        borderWidth:6,
                        opacity: 1,
                    }
                },
                data:carrydata
            }
        ]
    }
}


function cde() {
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                axisPointer: {
                    lineStyle:{
                        type: 'solid',
                        color: '#b2b5c1'
                    }
                }
            },
            textStyle: {
                fontWeight: 'bold',
                fontSize: 36
            },
            confine: true//限制图标区域内
        },
        dataZoom: {
            type: 'inside'
        },
        xAxis: {
            type: 'category',
            data: klineTransData.xcategory,
            axisPointer:{
                label:{
                    show:false
                }
            },
            scale: true,
            boundaryGap : false,
            axisLabel: {
                textStyle: {
                    color: '#000000',
                    fontSize: 24
                },
                formatter: function (value) {
                    return format(new Date(value), "MM/dd");
                }
            },
            axisTick:{
                inside:true
            },
            axisLine: {
                onZero: false,
                lineStyle: {
                    color: '#000'
                }
            },
            margin:16,
            splitLine: {show: false},
            splitNumber: 5
        },
        yAxis: [ {
            type: 'value',
            max:profitmax,
            min:-1*profitmax,
            interval:profitmax/2,
            axisPointer:{
                show:false
            },
            nameGap: 20,
            nameTextStyle: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize: 30
            },
            position: 'left',
            axisLabel: {
                textStyle: {
                    color: '#000000',
                    // fontWeight: 'bold',
                    fontSize: 24
                },
                formatter: function (val,index) {
                    if(isflag){
                        return val==0?0:val/10000+'w'
                    }else{
                        return val
                    }
                }
            },
            axisLine: {
                onZero: false,
                lineStyle: {
                    color: '#1386e4'
                },
                show: false
            },
            axisTick: {
                show: false
            },
            //splitNumber: 3
        },
            {
                type: 'value',
                axisPointer:{
                    show:false
                },
                min: 0,
                max: fmax,
                interval:fenge,
                position: 'right',
                axisLabel: {
                    textStyle: {
                        color: '#000000',
                        // fontWeight: 'bold',
                        fontSize: 24
                    }
                },
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: '#1386e4'
                    },
                    show: false
                },
                axisTick: {
                    show: false
                },
            }
        ],
        series: [{
            name: '盈亏',
            type: 'line',
            smooth: true,
            symbolSize:0,
            lineStyle: {
                normal: {
                    width: 4,
                    color: '#78C3FF',
                    //  shadowColor: 'rgba(0,0,0,0.4)',
                    // shadowBlur: 10,
                    // shadowOffsetY: 10
                }
            },
            data: klineTransData.profit
        },
            {
                name: '交易频率',
                type: 'line',
                show:false,
                smooth: true,
                symbolSize:0,
                yAxisIndex: 1,
                lineStyle: {
                    normal: {
                        width: 4,
                        color: '#FFB356',
                        //  shadowColor: 'rgba(0,0,0,0.1)',
                        //  shadowBlur: 10,
                        // shadowOffsetY: 10
                    }
                },
                data: klineTransData.frequency
            }
        ]
    }
}
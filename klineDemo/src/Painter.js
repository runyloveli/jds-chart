/**
 * Created by JDR on 2017/9/29.
 */
var util = require('./core/util');
var config = require('./core/config');
var Sketch = require("Sketch");
var Scale = require("./scale/Scale");
var Painter = function(root, storage, opts, ctx) {
    this.options = opts;
    this.dpr = opts.devicePixelRatio || config.devicePixelRatio;
    this.root = root;
    this.storage = storage;
    this.ctx = ctx;
};
function calcAxisValues(high, low, count) {
    var diff = high - low;
    var space = diff / (count - 1);
    var result = [];
    for (var i = 0; i < count; i++) {
        var value = (high - i * space) * 1.0;
        if(value > 100){
            value = value.toFixed(2);
        } else if (value > 10000) {
            value = (value / 10000).toFixed(2) + '万';
        } else if (100 < value && value < 100000000) {
            value = (value / 100000000).toFixed(2) + '亿';
        } else if (value < 100) {
            value = value*100;
            value = value.toFixed(2) + '%';
        }
        result.push(value);
    }
    return result;
}
Painter.prototype = {
    constructor: Painter,
    crossKline_data:null,
    crossVolume_data:null,
    refresh: function(distance) {
        var list = this.storage.getDisplayList(true);
        this._paintList(list, distance);
    },
    cross: function(cvs,x,y){
        //十字坐标
        var ctx = cvs.getContext('2d');
        if(this.options.type=="candlestick"){
            var crossSketch = new Sketch(ctx,this.options);
            crossSketch.clearCanvas();
            for (var i = 0; i < this.crossKline_data.length; i++) {
                var leftX = this.getX(i)-this.options.spaceWidth;
                var rightX = this.getX(i) + this.options.barWidth;
                if(x>=leftX&&x<rightX){
                    var tmpY = this.getY(this.crossKline_data[i][1]);
                    var tmpX = this.getX(i)-cvs.offsetLeft+this.options.barWidth*this.dpr/2;
                    //横线
                    crossSketch.paintLine(0,tmpY,this.options.region.width,0);
                    //竖线
                    crossSketch.paintLine(tmpX,0,0,this.options.region.height);
                    //圆点
                    var p = {x:tmpX, y:tmpY};
                    crossSketch.paintCicle(p,2,"#000");
                }
            }
        }else if(this.options.type=="bar"){
            var crossSketch = new Sketch(ctx,this.options);
            crossSketch.clearCanvas();
            for (var i = 0; i < this.crossVolume_data.length; i++) {
                var leftX = this.getX(i)-this.options.spaceWidth;
                var rightX = this.getX(i) + this.options.barWidth;
                console.log(this.getX(i))
                if(x>=leftX&&x<rightX){
                    var tmpY = this.getY(this.crossVolume_data[i][1]);
                    var tmpX = this.getX(i)-cvs.offsetLeft+this.options.barWidth*this.dpr/2;
                    
                    //横线
                    //crossSketch.paintLine(0,tmpY,this.options.region.width,0);
                    //竖线
                    crossSketch.paintLine(tmpX,0,0,this.options.region.height);
                    //圆点
                    // var p = {x:tmpX, y:tmpY};
                    // crossSketch.paintCicle(p,2,"#000");
                }
            }
        }
    },
    _paintList: function(list, distance){
        var dpr = this.dpr;
        distance = distance || 0 ;
        var JdsChart_Movenum = 0;
        var options = this.options;
        var init = new Sketch(this.ctx, options);
        this.ctx.clearRect(0, 0, options.size.width*dpr, (options.size.height+6)*dpr);
        var series = options.series;
        var chartNum = 1;
        init.grid(options);
        if(util.isArray(series)){
            chartNum = series.length;
        }
        var categoryData = options.xAxis.data;
        var JdsChart_Barcount = Math.floor(options.size.width/(options.barWidth + options.spaceWidth));
        for(var a = 0;a < chartNum;a++){
            if(series[a].type == 'candlestick'){
                var kseries = series[a];
            }
        }
        var filteredKlineData = [];
        if(kseries){
            var klineData = kseries.data;
            var klineDataLength = kseries.data.length;
            for (var i = 0; i < klineDataLength; i++) {
                filteredKlineData.push(klineData[i]);
            }
            var allLength = filteredKlineData.length * (options.barWidth + options.spaceWidth)*dpr;
            var nowLength = JdsChart_Barcount * (options.barWidth + options.spaceWidth)*dpr;
            if(distance > allLength - nowLength){
                distance = allLength - nowLength;
            }
            JdsChart_Movenum = Math.floor(distance/(options.barWidth + options.spaceWidth)/dpr);
        }
        var high, low, highV,lowV;
        var dataFomatte = [];
        var JdsChart_Difference = filteredKlineData.length - JdsChart_Barcount;
        var JdsChart_NowData = filteredKlineData;
        
        if(JdsChart_Difference > 0){
            if(filteredKlineData.length - JdsChart_Barcount - JdsChart_Movenum > 0) {
                JdsChart_NowData = filteredKlineData.slice(filteredKlineData.length - JdsChart_Barcount - JdsChart_Movenum, filteredKlineData.length - JdsChart_Movenum);
                categoryData = options.xAxis.data.slice(filteredKlineData.length - JdsChart_Barcount - JdsChart_Movenum, filteredKlineData.length - JdsChart_Movenum);
            } else {
                JdsChart_NowData = filteredKlineData.slice(0, JdsChart_Barcount);
                categoryData = options.xAxis.data.slice(0, JdsChart_Barcount);
            }
        }
        this.crossKline_data = JdsChart_NowData;
        JdsChart_NowData.each(function(val, a, i) {
            if(val[1] > val[0]) {
                val.push(1, val[1], val[0]);
            } else if (val[1] == val[0]) {
                val.push(0, val[0], val[1]);
            } else if (val[1] < val[0]) {
                val.push(-1, val[0], val[1]);
            }
            dataFomatte.push(val);
            if (i == 0) {
                high = val[2];
                low = val[3];
                highV = val[6];
                lowV = val[6];
            } else {
                high = Math.max(val[2], high);
                low = Math.min(low, val[3]);
                highV = Math.max(val[5], highV);
                lowV = Math.min(lowV, val[5]);
            }
        });
        var JdsChart_LineDifference = 0;
        if(options.type == 'candlestick') {
            var ranges = this.calculateCandleWidth(JdsChart_NowData) || {};
            //filteredData 原数据（开，收，低，高）
            //dataFomatter 格式化数据（开，收，低，高，类型，实体上边界线价位，实体下边界线价位）
            var highest = ranges.maximum;
            var lowest = ranges.minimum;
            var ratiok = ranges.ratio;
            this.high = highest;
            this.low = lowest;
            this.highV = highV;
            this.lowV = lowV;
            this.currentX = 0;
            //根据移动距离测算当前窗口开始与结束之间最大最小值
            var priceItems = calcAxisValues(highest, lowest, options.grid.rowNum);
            init.createYAxis(options, priceItems);
            init.createXAxis(options, categoryData);
            //渲染K线
            init.paintCandleLine(dataFomatte, this, ratiok, distance);
            //渲染MA辅助线
            var priceMA5 = this.calculateMA(5,series[1].data);
            var priceMA10 = this.calculateMA(10,series[1].data);
            var priceMA20 = this.calculateMA(20,series[1].data);
            JdsChart_Movenum = Math.floor(distance/(options.barWidth + options.spaceWidth)/dpr);
            JdsChart_LineDifference = series[1].data.length - JdsChart_Barcount;
            priceMA5 = maCalcute(priceMA5, series[1].data.length);
            priceMA10 = maCalcute(priceMA10, series[1].data.length);
            priceMA20 = maCalcute(priceMA20, series[1].data.length);
            if(priceMA5.length > 0){
                init.drawMA(priceMA5, this, '#ff9700');
                if(document.getElementById('MA5')){
                    document.getElementById('MA5').innerHTML = priceMA5[priceMA5.length - 1];
                }
            }
            if(priceMA10.length > 0){
                init.drawMA(priceMA10, this, '#00b4ff');
                if(document.getElementById('MA10')){
                    document.getElementById('MA10').innerHTML = priceMA10[priceMA10.length - 1];
                }
            }
            if(priceMA20.length > 0){
                init.drawMA(priceMA20, this, '#d900ff');
                if(document.getElementById('MA20')){
                    document.getElementById('MA20').innerHTML = priceMA20[priceMA20.length - 1];
                }
            }
        }
        else if(options.type == 'bar'){
            //遍历获取数据
            for(var j = 0;j < chartNum;j++){
                if(series[j].type == 'bar'){
                    var barseries = series[j];
                }
            }
            if(barseries){
                var yuanBarData = barseries.data;
                var barData = barseries.data.barVolume;
                //var barDataLength = barseries.data.barVolume.length;
                var barallLength = barData.length * (options.barWidth + options.spaceWidth)*dpr;
                var barnowLength = JdsChart_Barcount * (options.barWidth + options.spaceWidth)*dpr;
                if(distance > barallLength - barnowLength){
                    distance = barallLength - barnowLength;
                }
                JdsChart_Movenum = Math.floor(distance/(options.barWidth + options.spaceWidth)/dpr);
                var JdsChart_BarDifference = barData.length - JdsChart_Barcount;
                var JdsChart_BarNowData = barData;
                var JdsChart_KNow = {};
                if(JdsChart_BarDifference > 0){
                    if(barData.length - JdsChart_Barcount - JdsChart_Movenum > 0) {
                        JdsChart_BarNowData = barData.slice(barData.length - JdsChart_Barcount - JdsChart_Movenum, barData.length - JdsChart_Movenum);
                        JdsChart_KNow = yuanBarData.values.slice(yuanBarData.values.length - JdsChart_Barcount - JdsChart_Movenum, yuanBarData.values.length - JdsChart_Movenum);
                    } else {
                        JdsChart_BarNowData = barData.slice(0, JdsChart_Barcount);
                        JdsChart_KNow = yuanBarData.values.slice(0, JdsChart_Barcount);
                    }
                }
            }
            this.crossVolume_data = JdsChart_BarNowData;
            //计算柱状图y轴数值范围
            var barRanges = this.calculateBarRanges(JdsChart_BarNowData) || {};
            //柱状图最高最低赋值
            var barHighest = this.barHighest = barRanges.maximum;
            var barLowest = this.barLowest = barRanges.minimum;
            var priceItemsBar = calcAxisValues(barHighest, barLowest, options.grid.rowNum);
            init.createYAxis(options, priceItemsBar);
            init.createXAxis(options, categoryData);
            //渲染柱状图
            var ratio = 1;
            init.paintBar(JdsChart_KNow, JdsChart_BarNowData, this, ratio, distance);
            this.high = barHighest;
            this.low = barLowest;
            var volumeMA5 = this.calcuteBarMA(5,series[1].data.barVolume);
            var volumeMA10 = this.calcuteBarMA(10,series[1].data.barVolume);
            var volumeMA20 = this.calcuteBarMA(20,series[1].data.barVolume);
            JdsChart_Movenum = Math.floor(distance/(options.barWidth + options.spaceWidth)/dpr);
            JdsChart_LineDifference = series[1].data.barVolume.length - JdsChart_Barcount;
            volumeMA5 = maCalcute(volumeMA5, series[1].data.barVolume.length);
            volumeMA10 = maCalcute(volumeMA10, series[1].data.barVolume.length);
            volumeMA20 = maCalcute(volumeMA20, series[1].data.barVolume.length);
            if(volumeMA5.length > 0){
                init.drawMA(volumeMA5, this, '#ff9700');
                if(document.getElementById('volMA5')){
                    var value = volumeMA5[volumeMA5.length - 1];
                    if(value > 10000){
                        value = value * 1;
                        value = (value / 10000).toFixed(2) + '万';
                    } else if (value > 100000000) {
                        value = value * 1;
                        value = (value / 100000000).toFixed(2) + '亿';
                    } else if (value < 10000) {
                        value = value * 1;
                        value = value.toFixed(2);
                    }
                    document.getElementById('volMA5').innerHTML = value;
                }
            }
            if(volumeMA10.length > 0){
                init.drawMA(volumeMA10, this, '#00b4ff');
                if(document.getElementById('volMA10')){
                    var value10 = volumeMA10[volumeMA10.length - 1];
                    if(value10 > 10000){
                        value10 = value10 * 1;
                        value10 = (value10 / 10000).toFixed(2) + '万';
                    } else if (value10 > 100000000) {
                        value10 = value10 * 1;
                        value10 = (value10 / 100000000).toFixed(2) + '亿';
                    } else if (value10 < 10000) {
                        value10 = value10 * 1;
                        value10 = value10.toFixed(2);
                    }
                    document.getElementById('volMA10').innerHTML = value10;
                }
            }
            if(volumeMA20.length > 0){
                init.drawMA(volumeMA20, this, '#d900ff');
                if(document.getElementById('volMA20')){
                    var value20 = volumeMA20[volumeMA20.length - 1];
                    if(value20 > 10000){
                        value20 = value20 * 1;
                        value20 = (value20 / 10000).toFixed(2) + '万';
                    } else if (value20 > 100000000) {
                        value20 = value20 * 1;
                        value20 = (value20 / 100000000).toFixed(2) + '亿';
                    } else if (value20 < 10000) {
                        value20 = value20 * 1;
                        value20 = value20.toFixed(2);
                    }
                    document.getElementById('volMA20').innerHTML = value20;
                }
            }
        }
        else if (options.type == 'volume') {
            for(var v = 0;v < chartNum;v++){
                if(series[v].type == 'bar'){
                    var volumeseries = series[v];
                }
            }
            if(volumeseries){
                var volumeData = volumeseries.data.values;
                var JdsChart_VNow = [];
                for(var u = 0; u < volumeData.length; u++) {
                    JdsChart_VNow.push(volumeData[u][1]);
                }
                var volumeRanges = this.calculateBarRanges(JdsChart_VNow) || {};
                var volumeHighest = this.volumeHighest = volumeRanges.maximum;
                var volumeLowest = this.volumeLowest = volumeRanges.minimum;
                var priceItemsVolume = calcAxisValues(volumeHighest, volumeLowest, options.grid.rowNum);
                init.createYAxis(options, priceItemsVolume);
                init.paintBar(volumeData, JdsChart_VNow, this, 1, distance);
            }
        }
        else if(options.type == 'line') {
            var averageParse = [];
            var lineDataParse = [];
            var highLowParse = [];
            for(var c = 0;c < chartNum;c++){
                if(series[c].type == 'line'){
                    var lineseries = series[c];
                }
            }
            if(lineseries) {
                var lineData = lineseries.data;
            }
            for(var e = 0; e < lineData.length; e++) {
                averageParse.push(lineData[e][3].toFixed(2));
                lineDataParse.push(lineData[e][0].toFixed(2));
                highLowParse.push(lineData[e][6]);
                if(e) {
                    if(lineData[e][5] != lineData[e-1][5]) {
                        window.JdsChart_seperate = e;
                    }
                }
            }
            var lineHighest = Math.max.apply(Math,lineDataParse);
            var lineLowest = Math.min.apply(Math,lineDataParse);
            var highLowHighest = Math.max.apply(Math,highLowParse);
            var highLowLowest = Math.min.apply(Math,highLowParse);
            var yesterdayEnd = this.options.yesterdayEnd;
            var cha1 = lineHighest - yesterdayEnd;
            var cha2 = yesterdayEnd - lineLowest;
            if(cha1 > cha2){
                lineLowest = yesterdayEnd - (lineHighest - yesterdayEnd);
            } else {
                lineHighest = yesterdayEnd + (yesterdayEnd - lineLowest);
            }
            var yesterPrice = 0;
            var highlowcha1 = highLowHighest - yesterPrice;
            var highlowcha2 = yesterPrice - highLowLowest;
            if(highlowcha1 > highlowcha2){
                highLowLowest = yesterPrice - (highLowHighest - yesterPrice);
            } else {
                highLowHighest = yesterPrice + (yesterPrice - highLowLowest);
            }
            var priceItemsLine = calcAxisValues(lineHighest, lineLowest, options.grid.rowNum);
            var highLowLine = calcAxisValues(highLowHighest, highLowLowest, options.grid.rowNum);
            this.lhigh = lineHighest;
            this.maxDiff = lineHighest - lineLowest;
            init.createYAxis(options, priceItemsLine, 'first');
            init.createYAxis(options, highLowLine, 'second');
            if(options.sub_type === 'min_line') {
                init.createXAxis(options, ['20:00', '15:30']);
            } else {
                var date = new Date();
                var nowYear = date.getFullYear();
                var nowDay = date.getDate();
                var nowMonth = date.getMonth() + 1;
                var dater = nowYear + '/' + nowMonth + '/' + nowDay;
                var nowdate = [];
                nowdate.push(dater);
                init.createXAxis(options, nowdate);
            }

            init.drawLine(lineDataParse, this);
            init.drawAverage(averageParse, this, '#ff9700');
        }
        function maCalcute(source, length){
            if(JdsChart_LineDifference > 0){
                if(JdsChart_LineDifference - JdsChart_Movenum > 0) {
                    source = source.slice(JdsChart_LineDifference - JdsChart_Movenum, length - JdsChart_Movenum);
                } else {
                    source = source.slice(0, JdsChart_Barcount);
                }
            }
            return source;
        }
    },
    _doPaintList: function(){},
    _doPaintEl: function(){},
    resize: function(){},
    getV: function(i, JdsChart_Barnumber) {
        var ser = this.options.series;
        return i * (this.options.region.width / (JdsChart_Barnumber - 1));
    },
    getX: function(i) {
        var result = (i + 0.5) * (this.options.spaceWidth + this.options.barWidth);
        if (result * 10 % 10 == 0) result += .5;
        return result;
    },
    getY: function(price) {
        return ((this.high - price) * this.options.region.height / (this.high - this.low)) + this.options.region.y;
    },
    getA: function(i, JdsChart_NowNumber) {
        var ser = this.options.series;
        //return i * (this.options.region.width / (ser[0].data.length - 1));
        return i * (this.options.region.width / (JdsChart_NowNumber - 1));
    },
    getB: function(i) { //获取价格点Y位置
        return ((this.lhigh - i) * this.options.region.height / this.maxDiff)
    },
    getM: function(i, JdsChart_NowNumber) {
        var ser = this.options.series;
        //return i * (this.options.region.width / (ser[0].data.length - 1));
        return i * (this.options.region.width / (JdsChart_NowNumber - 1));
    },
    getI: function(i) { //获取价格点Y位置
        return ((this.lhigh - i) * this.options.region.height / this.maxDiff)
    },
    getBarY: function(value) {
        return ((this.barHighest - value) * this.options.volume.height / (this.barHighest - this.barLowest));
    },
    getVolumeY: function(value) {
        return ((this.volumeHighest - value) * this.options.volume.height / (this.volumeHighest - this.volumeLowest));
    },
    calculateCandleWidth: function (data) {
        var scale = new Scale(data);
        var maximum = scale.candleMax();
        var minimum = scale.candleMin();
        var range = maximum - minimum;
        return {'maximum': maximum,'minimum': minimum,'range': range,'ratio': 0.8};
    },
    calculateBarRanges: function(data) {
        var scale = new Scale(data);
        var maximum = scale.barMax().toFixed();
        var minimum = scale.barMin().toFixed();
        var range = maximum - minimum;
        return {'maximum': maximum,'minimum': minimum,'range': range,'ratio': 0.8};
    },
    calculateMA: function(dayCount, data) {
        var result = [];
        for (var i = 0, len = data.length; i < len; i++) {
            if (i < dayCount) {
                result.push('-');
                continue;
            }
            var sum = 0;
            for (var j = 0;  j < dayCount; j++) {
                sum += data[i - j][1];
            }
            result.push((sum / dayCount).toFixed(2));
        }
        return result;
    },
    calcuteBarMA: function(dayCount, data){
        var result = [];
        for(var j = 0, ben = data.length; j < ben; j++) {
            if(j < dayCount) {
                result.push('-');
                continue;
            }
            var sum = 0;
            for(var z = 0; z < dayCount; z++) {
                sum += data[j - z];
            }
            result.push((sum / dayCount).toFixed(2));
        }
        return result;
    }
};
module.exports = Painter;
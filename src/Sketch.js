var config = require('./core/config');
function Sketch(context, options) {
    this.dpr = config.devicePixelRatio;
    this.ctx = context;
    this.options = options||{};
}
Sketch.prototype = {
    constructor:Sketch,
    clearCanvas:function(){
        var ctx = this.ctx;
        ctx.clearRect(0,0,this.options.region.width*this.dpr,this.options.region.height*this.dpr);
    },
    /*画直线（x坐标，y坐标，x轴移动距离，y轴移动距离）*/
    paintLine: function(x, y, width, height) {
        var dpr = this.dpr;
        x = x * dpr;
        y = y * dpr;
        width = width * dpr;
        height = height * dpr;
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
    },
    paintText: function(text, x, y) {
        var dpr = this.dpr;
        x = x * dpr;
        y = y * dpr;
        this.ctx.font = '24px PingFangSC-Regular';
        this.ctx.fillText(text, x, y);
    },
    grid: function(options) {
        var ctx = this.ctx;
        ctx.strokeStyle = options.grid.borderColor || "#000";
        ctx.lineWidth = options.grid.borderWidth || "1px";
        var spaceHeight = options.region.height / (options.grid.rowNum - 1);
        var regionWidth = options.region.width;
        var regionHeight = options.region.height;
        var xMove = regionWidth - options.grid.left - options.grid.right;
        var yMove = regionHeight - options.grid.top - options.grid.bottom;
        for(var i = 0; i <= options.grid.rowNum; i++) {
            var x = options.grid.left;
            var y = options.grid.top + regionHeight * i / (options.grid.rowNum -1);
            this.paintLine(x, y, xMove, 0);
        }
        for(var j = 0; j < options.grid.coloumNum + 1; j++) {
            var a = (regionWidth-options.grid.left-options.grid.right)/(options.grid.coloumNum) * j;
            var b = options.grid.top;
            this.paintLine(a, b, 0, yMove);
        }
    },
    paintVine: function(x, y, height) {
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.stroke();
    },
    createYAxis: function(options,priceItems,order) {
        if(!options.yAxis.show){
            return;
        }
        var ctx = this.ctx;
        options.yAxis.region.x_two = options.yAxis.region.x_two || 0;
        ctx.strokeStyle = options.Hline.color || "#000";
        ctx.lineStyle = options.Hline.lineStyle || "solid";
        ctx.lineWidth = options.Hline.lineWidth || "1px";
        var spaceHeight = options.region.height / (options.grid.rowNum - 1);
        ctx.fillStyle = options.yAxis.backgroundColor;
        ctx.fillRect(0, 0, options.yAxis.backgroundWidth, options.yAxis.backgroundheight);
        ctx.fillStyle = options.yAxis.color.secondColor;
        ctx.font = options.yAxis.font;
        var xCoord = 0;
        if(order == 'first') {
            xCoord = options.yAxis.region.x;
        } else if (order == 'second') {
            xCoord = options.yAxis.region.x_two;
        }
        for (var i = 0; i < options.grid.rowNum; i++) {
            var y = options.region.y + spaceHeight * i;
            var b = 0;
            if(i){
                b = 6;
            }
            if(i == options.grid.rowNum-1) {
                b = 15;
            }
            if(priceItems[i].indexOf('-') >= 0) {
                xCoord -= 1
            }
            if(options.grid.rowNum%2 == 0) {
                if(i <= options.grid.rowNum/2) {
                    ctx.fillStyle = options.yAxis.color.firstColor;
                } else {
                    ctx.fillStyle = options.yAxis.color.thirdColor;
                }

            } else {
                if((i+0.5) < options.grid.rowNum/2) {
                    ctx.fillStyle = options.yAxis.color.firstColor;
                } else if((i+0.5) == options.grid.rowNum/2) {
                    ctx.fillStyle = options.yAxis.color.secondColor;
                } else if ((i+0.5) > options.grid.rowNum/2) {
                    ctx.fillStyle = options.yAxis.color.thirdColor;
                }
            }
            this.paintText(priceItems[i], xCoord, y + 12 - b);
        }
    },
    createXAxis: function(options, data) {//X轴刻度
        if(!options.xAxis.show){
            return;
        }
        options = options.xAxis;

        var num = options.splitNumber;
        this.ctx.fillStyle = options.color;
        this.ctx.font = options.font;
        if(options.sub_type === 'minline') {
            num = 2;
        }
        if(options.sub_type === 'two_line') {
            num = 1;
        }
        var picking = pick(data, num);
        var steps = options.region.width/(num-1) - 30;
        for (var i = 0; i < picking.length; i++) {
            if(picking.length == 1){
                this.paintText(picking[i], options.region.width/2 - picking[i].length*3, options.region.y);
            } else if (picking.length == 2) {
                if(i == 0) {
                    this.paintText(picking[i], 0, options.region.y);
                } else {
                    this.paintText(picking[i], options.region.width-picking[i].length*7, options.region.y);
                }
            } else if(picking.length >= 3) {
                if(i == 0) {
                    this.paintText(picking[i], options.region.x + steps * i - 5, options.region.y);
                } else if(i === picking.length-1) {
                    this.paintText(picking[i], options.region.x + steps * i - picking[i].length*1, options.region.y)
                } else {
                    this.paintText(picking[i], options.region.x + steps * i - 5, options.region.y)
                }

            }
        }
        function pick(source, num) {
            var picked = [];
            picked.push(source[0]);
            if(source.length == 0) {
                return '';
            } else if (source.length == 1){
                return picked;
            } else if (source.length == 2) {
                picked.push(source[1]);
            } else if (source.length >= 3) {
                for(var i = 0;i < num-2;i++){
                    picked.push(source[Math.ceil(source.length/num*(i+1))]);
                }
                picked.push(source[source.length-1]);
            }
            return picked;
        }
    },
    drawLine: function(priceArray, self) {
        var type = self.options.type || '';
        var sub_type = self.options.sub_type || '';
        var JdsChart_NowNumber = 1320;
        if(sub_type === 'min_line') {
            JdsChart_NowNumber = 660;
        }
        this.maxDotsCount = priceArray.length;
        var col = '';
        for (var i = 0; i < this.maxDotsCount; i++) {
            this.paintMAline(i, self.getA(i, JdsChart_NowNumber), self.getB(priceArray[i]) + this.options.region.y, col, type)
        }
    },
    drawAverage: function(priceArray, self, col) {
        var type = self.options.type || '';
        var sub_type = self.options.sub_type || '';
        var JdsChart_NowNumber = 1320;
        if(sub_type === 'min_line') {
            JdsChart_NowNumber = 660;
        }
        this.maxDotsCount = priceArray.length;
        for (var i = 0; i < this.maxDotsCount; i++) {
            this.paintMAline(i, self.getM(i, JdsChart_NowNumber), self.getI(priceArray[i]) + this.options.region.y, col, type)
        }
    },
    drawMA: function(priceArray, self, color) {
        this.maxDotsCount = priceArray.length;
        for (var i = 0; i < this.maxDotsCount; i++) {
            this.paintMAline(i, self.getX(i), self.getY(priceArray[i]) + this.options.region.y, color)
        }
        //for (var j = 0; j < this.maxDotsCount; j++) {
        //    this.paintItemDiv(j, self.getX(j)+distance, self.getY(priceArray[j]) + this.options.region.y)
        //}
    },
    paintMAline: function(i, x, y, col, type) {
        type = type || '';
        var ctx = this.ctx;
        var dpr = this.dpr;
        ctx.strokeStyle = col || '#333333';
        ctx.lineWidth = 2;
        x = x * dpr;
        y = y * dpr;
        if(type == 'line') {
            if (i == 0) {
                ctx.lineStyle = 'solid';
                ctx.strokeStyle = 'rgba(12,22,22,1)';
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else if (i == this.maxDotsCount - 1) {
                ctx.lineTo(x, y);
                ctx.stroke();
            } else if(i === window.JdsChart_seperate) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        } else {
            if (i == 0) {
                ctx.lineStyle = 'solid';
                ctx.strokeStyle = 'rgba(12,22,22,1)';
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else if (i == this.maxDotsCount - 1) {
                ctx.lineTo(x, y);
                ctx.stroke();
            } else {
                ctx.lineTo(x, y);
            }
        }

    },
    paintItemDiv: function(i, x, y) { //价格走势图白色渐变区域
        var ctx = this.ctx;
        if (i == 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (i == this.maxDotsCount - 1) {
            ctx.lineTo(x, y);
            ctx.strokeStyle = 'rgba(255,255,255,0)';
            var my_gradient = ctx.createLinearGradient(0, 0, 0, 170);
            my_gradient.addColorStop(0, 'rgba(255,255,255,0.6)');
            my_gradient.addColorStop(1, 'rgba(255,255,255,0.2)');
            ctx.fillStyle = my_gradient;
            ctx.lineTo(x, this.options.region.height + this.options.region.y);
            ctx.lineTo(this.options.region.x, this.options.region.height + this.options.region.y);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        } else {
            ctx.lineTo(x, y);
        }
    },
    paintCandleLine: function(items, dev, ratio, distance) {
        this.currentX = 0;
        for (var i = 0; i < items.length; i++) {
            this.drawCandle(i, items[i], dev, ratio, distance);
        }
    },
    paintBar: function(JdsChart_KNow, JdsChart_BarNowData, dev, ratio){
        var barDatas = JdsChart_BarNowData;
        var kDatas = JdsChart_KNow;
        for(var z = 0; z < barDatas.length; z++){
            this.drawVolume(z, barDatas[z], kDatas[z], dev, ratio);
        }
    },
    paintVolumeBorder:function(){
        this.ctx.lineWidth = "1px";
        this.ctx.strokeStyle = "#efefef";
        this.ctx.strokeRect(this.options.volume.x, this.options.volume.y, this.options.volume.width, this.options.volume.height);
    },
    drawVolume:function(i,value,ki,dev,ratio){
        var dpr = this.dpr;
        var style = this.options.series[1];
        var color = style.itemStyle.riseColor;
        var color0 = style.itemStyle.fallColor;
        var lineX, topY, JdsChart_Barnumber=0;
        if(dev.options.type == 'bar'){
            lineX = dev.getX(i);//获取x轴坐标
            topY = dev.getBarY(value);
        } else if(dev.options.type == 'volume') {
            if(dev.options.sub_type == 'min_line') {
                JdsChart_Barnumber = 660;
            } else {
                JdsChart_Barnumber = 1320;
            }
            lineX = dev.getV(i, JdsChart_Barnumber);//获取x轴坐标
            topY = dev.getVolumeY(value);
        }
        var topX = lineX - this.options.barWidth / 2;
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        if(dev.options.type == 'bar') {
            if (ki[1] > ki[0]) { //红线
                colors = color;
                this.ctx.strokeStyle = colors;
                this.ctx.strokeRect(topX*dpr, topY*dpr, this.options.barWidth*dpr, (dev.options.volume.y+dev.options.volume.height-topY)*dpr);
            }
            if (ki[1] < ki[0]) { //绿线
                colors = color0;
                this.ctx.fillStyle = colors;
                this.ctx.fillRect(topX*dpr, topY*dpr, this.options.barWidth*dpr, (dev.options.volume.y+dev.options.volume.height-topY)*dpr);
            }
            if (ki[1] == ki[0]) { //白线
                colors = '#000';
                this.ctx.fillStyle = colors;
                this.ctx.fillRect(topX*dpr, topY*dpr, this.options.barWidth*dpr, (dev.options.volume.y+dev.options.volume.height-topY)*dpr);
            }
        } else if (dev.options.type == 'volume') {
            if (ki[4] == 1) { //红线
                colors = color;
                this.ctx.strokeStyle = colors;
                this.ctx.strokeRect(topX*dpr, topY*dpr, this.options.barWidth*dpr, (dev.options.volume.y+dev.options.volume.height-topY)*dpr);
            }
            if (ki[4] == -1) { //绿线
                colors = color0;
                this.ctx.fillStyle = colors;
                this.ctx.fillRect(topX*dpr, topY*dpr, this.options.barWidth*dpr, (dev.options.volume.y+dev.options.volume.height-topY)*dpr);
            }
            if (ki[4] == 0) { //白线
                colors = '#000';
                this.ctx.fillStyle = colors;
                this.ctx.fillRect(topX*dpr, topY*dpr, this.options.barWidth*dpr, (dev.options.volume.y+dev.options.volume.height-topY)*dpr);
            }
        }


    },
    drawCandle: function(i, ki, dev, ratio, distance) {
        var ratios = ratio || 1;
        var dpr = this.dpr;
        var color = dev.options.riseColor;
        var lineX = dev.getX(i);
        if (this.currentX == 0) this.currentX = lineX;
        else {
            if (lineX - this.currentX < 1) return;
        }
        this.currentX = lineX;
        var topY = dev.getY(ki[3]);//上影线
        var bottomY = dev.getY(ki[2]);//下影线
        var candleX = lineX - dev.options.barWidth / 2; //实体开始X点
        var candleY = dev.getY(ki[6]);//实体开始Y点
        var candleBottomY = dev.getY(ki[7]);//实体结束Y点
        var candleHeight = candleBottomY - candleY;//实体的高度
        if (ki[5] > 0) { //红线
            color = dev.options.riseColor;
        }
        if (ki[5] < 0) { //绿线
            color = dev.options.fallColor;
        }
        if (ki[5] == 0) { //白线
            candleHeight = 1;
            fillcolor = '#949494';
        }
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        lineX = lineX * dpr;
        topY = topY * dpr;
        bottomY = bottomY * dpr;
        candleX = candleX * dpr;
        candleY = candleY * dpr;
        candleBottomY = candleBottomY * dpr;
        this.ctx.moveTo(lineX, topY);
        this.ctx.lineTo(lineX, candleY);
        this.ctx.moveTo(lineX, candleBottomY);
        this.ctx.lineTo(lineX, bottomY);
        if (ki[5] > 0) { //红线
            this.ctx.strokeRect(candleX, candleY, dev.options.barWidth*dpr, candleHeight*dpr);
        } else if (ki[5] <= 0){
            this.ctx.fillRect(candleX, candleY, dev.options.barWidth*dpr, candleHeight*dpr);
        }
        this.ctx.stroke();
    },
    paintTips: function(position, text) {
        this.paintVine(position.x, this.options.region.y, this.options.volume.y+this.options.volume.height-this.options.region.y)
        this.paintTipContent(580, text);
        this.paintPoint(position)
    },
    paintTipContent: function(width, text) {
        var options = this.options;
        this.ctx.fillStyle = "#efefef";
        this.ctx.fillRect(options.region.width - width, 0, width, options.region.y)
        this.ctx.fillStyle = "red";
        this.ctx.fillText(text, options.region.width - width + 10, 20)
    },
    paintPoint:function(position){
        this.paintCicle(position,8,"rgba(72,118,255,0.7)");
        this.paintCicle(position,4,"white")
        this.paintCicle(position,3,"rgba(72,118,255,1)")
    },
    paintCicle: function(position,r,color) {
        var ctx = this.ctx;
        //画一个实心圆
        ctx.beginPath();
        ctx.arc(position.x*this.dpr,position.y*this.dpr, r*this.dpr, 0, 360, false);
        ctx.fillStyle = color;
        ctx.fill(); //画实心圆
        ctx.closePath();
    }
};
module.exports = Sketch;
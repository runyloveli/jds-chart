//获取公司历史分时，K线数据，处理，填充
//调用jdschart框架，调用api，画出理想canvas

define(function(require, exports, module){
    require("../build/jdschart");
    var data = require("data").data;
    var Tool = require("Tool");
    Array.prototype.each = function(func, startIndex, endIndex) {
        startIndex = startIndex || 0;
        endIndex = endIndex || this.length - 1;
        for (var i = startIndex; i <= endIndex; i++) {
            func(this[i], this, i);
            if (this.breakLoop) {
                this.breakLoop = false;
                break;
            }
        }
    };
    const MaxEndTime = 6000000000;
    window.kline = {
        loadingData:false,
        ws:null,
        minData:[],//记录分时的实时数据
        minYeaData:[],//分时的昨日数据
        item:{
            // market:"GOLD",//市场
            // inst:"XAG",//合约
            market:"SSGE",//市场
            inst:"Au(T+D)",//合约
            close:0,
            unit:1
        },
        historyUrl:"http://history.quote2.jince.com/v2/http?resptype=JSON",
        typelist:[
            {name:"分时",type:"MIN",sourceData:[],starttime:0,endtime:MaxEndTime,limit:-1},//sourceData存储请求的K线源数据
            {name:"两日",type:"DAY2",sourceData:[],starttime:0,endtime:MaxEndTime,limit:-1},
            {name:"日K",type:"DAY",sourceData:[],starttime:0,endtime:MaxEndTime,limit:-300,addDate:1000},
            {name:"周K",type:"WEEK",sourceData:[],starttime:0,endtime:MaxEndTime,limit:-300,addDate:1000},
            {name:"月K",type:"MONTH",sourceData:[],starttime:0,endtime:MaxEndTime,limit:-300,addDate:1000},
            {name:"30分钟",type:"MIN30",sourceData:[],starttime:0,endtime:MaxEndTime,limit:-300,addDate:1000},
        ],
        nowType:{},
        state: {
            offsetWidth: 300,
            offsetHeight: 300
        },
        init: function() {
            jdschart.preInit();
            this.bindEvent();
            this.initWebSocket();

        },
        bindEvent: function() {
            var self = this;
            var menu_type = document.getElementsByClassName('menu_type');
            for(let i=0;i<menu_type.length;i++){
                var tmp = menu_type[i];
                tmp.onclick=function(){
                    window.JdsChart_Distance = 0;//置0后，画布回到初始位置
                    jdschart.showLoading();
                    var main = document.getElementById('JdsChart_kline');
                    var volume = document.getElementById('JdsChart_klineVolume');
                    var kline2 = document.getElementById('kline2');
                    var kline2volume = document.getElementById('kline2Volume');
                    // main.style.display = 'block';
                    // volume.style.display = 'block';
                    if(i<=1){
                        //main.height = "278px";
                        kline2.style.display = 'block';
                        kline2volume.style.display = 'block';
                        main.style.display = 'none';
                        volume.style.display = 'none';
                        document.getElementById('MA').style.display = 'none';
                        document.getElementById('calMA').style.display = 'none';
                        jdschart.dispose(kline2);
                        jdschart.dispose(kline2volume);
                    }else{
                        //main.height = "248px";
                        kline2.style.display = 'none';
                        kline2volume.style.display = 'none';
                        main.style.display = 'block';
                        volume.style.display = 'block';
                        document.getElementById('MA').style.display = 'block';
                        document.getElementById('calMA').style.display = 'block';
                        jdschart.dispose(main);
                        jdschart.dispose(volume);
                    }
                    
                    for(let j=0;j<menu_type.length;j++){
                        menu_type[j].setAttribute("class","menu_type");
                    }
                    this.setAttribute("class","menu_type pick");
                    self.nowType = self.typelist[i];
                    if(i==0){
                        if(self.nowType.sourceData.length==0){
                            self.min();
                        }else{
                            self.getDrawData("min");
                        }
                    }else if(i==1){
                        if(self.minData.length!=0&&self.minYeaData.length!=0){
                            self.getDrawData("min");
                        }else{
                            self.getHistoryData();
                        }
                    }else{
                        if(self.nowType.sourceData.length==0){
                            self.getHistoryData();
                        }else{
                            self.getDrawData();
                        }
                    }
                }
            }
        },
        initWebSocket(){
            if(this.ws!=null){
                this.ws.close();
                this.ws = null;
            }
            this.ws = new WebSocket(Tool.wsurl());
    
            var self = this;
            this.ws.onopen = function(){
                //去拿昨结
                self.yesterday();
                //去拿单位
                self.unit();
                //点击日K
                var type_klineday = document.getElementById('type_klineday');
                type_klineday.click();
            };
            this.ws.onmessage = function(e){
                var data = JSON.parse(e.data);
                if(data.ServiceType == "STATISTICS"){
                    //昨结
                    var tmp = data.QuoteData.StatisticsData[0];
                    // self.item.open = tmp.OpenPrice;
                    // self.item.over = tmp.PreClosePrice;
                    if(tmp.PreSettlementPrice==undefined){
                        self.item.close = tmp.PreClosePrice;//昨日结算价
                    }else{
                        self.item.close = tmp.PreSettlementPrice;//昨结
                    }
                    // self.dyna();//拿实时行情
                }else if(data.ServiceType == "DYNA"){
                    // var tmp = data.QuoteData.DynaData[0];
                    // self.item.total = tmp.Volume;
                    // self.item.high = tmp.HighestPrice;
                    // self.item.low = tmp.LowestPrice;
                    // self.item.price = tmp.LastPrice;
                    // self.time = new Date(tmp.Time*1000);
                }else if(data.ServiceType == "KLINE"){
                    for(let i=0;i<self.typelist.length;i++){
                        var tmpType = self.typelist[i];
                        if(data.Period==tmpType.type){
                            if(tmpType.sourceData.length==0){
                                //当他没有的时候，直接加入
                                for(let i=0;i<data.QuoteData.KlineData.length;i++){
                                    tmpType.sourceData.push(data.QuoteData.KlineData[i]);
                                }
                            }else{
                                //有的时候需要判断是更新还是插入
                                var tmpObj = tmpType.sourceData[tmpType.sourceData.length-1];
                                for(let i=0;i<data.QuoteData.KlineData.length;i++){
                                    if(tmpObj.Time==data.QuoteData.KlineData[i].Time){
                                        tmpType.sourceData[tmpType.sourceData.length-1] = data.QuoteData.KlineData[i];
                                    }else if(tmpObj.Time<data.QuoteData.KlineData[i].Time){
                                        tmpType.sourceData.push(data.QuoteData.KlineData[i]);
                                    }
                                }
                            }
                            self.getDrawData();
                        }
                    }
                }else if(data.ServiceType=="STATUS"){
                    //状态
                    //self.status = data.QuoteData.InstStatusData[0].StatusType;
                }else if(data.ServiceType == "MIN"){
                    //今日的是一直都在实时推、2日的是历史的加上今日的
                    if(self.minData.length==0){
                        //当他没有的时候，直接加入
                        for(let i=0;i<data.QuoteData.MinData.length;i++){
                            self.minData.push(data.QuoteData.MinData[i]);
                        }
                    }else{
                        //有的时候需要判断是更新还是插入
                        var tmpObj = self.minData[self.minData.length-1];
                        for(let i=0;i<data.QuoteData.MinData.length;i++){
                            if(tmpObj.Time==data.QuoteData.MinData[i].Time){
                                self.minData[self.minData.length-1] = data.QuoteData.MinData[i];
                            }else if(tmpObj.Time<data.QuoteData.MinData[i].Time){
                                self.minData.push(data.QuoteData.MinData[i]);
                            }
                        }
                    }
                    self.getDrawData('min');
                }else if(data.ServiceType == "STATIC"){
                    //计算单位
                    self.item.unit = data.QuoteData.StaticData[0].TradingUnit;
                }
            }
        },
        getDrawData(type){
            //获取需要绘制的data
            // if(this.drawData.length==0){
            //     //设置宽、高
            //     var kcavs_width = document.body.offsetWidth - 10;
            //     this.option.size.width = kcavs_width;
            //     this.option.size.height = kcavs_width*0.72-20;
            //     this.option.region.width = kcavs_width;
            //     this.option.region.height = kcavs_width*0.72-35;
            //     this.option.xAxis.region.width = kcavs_width;
            //     this.option.xAxis.region.y = kcavs_width*0.72-20;
            //     this.$refs.kCanvas.style.width = kcavs_width+"px";
            //     this.$refs.kCanvas.style.height = kcavs_width*0.72+"px";
            // }
            if(type=="min"){
                if(this.nowType.type=="MIN"){
                    this.nowType.sourceData = this.minData;
                }else if(this.nowType.type=="DAY2"){
                    this.nowType.sourceData = this.minYeaData.concat(this.minData);
                }
            }
            var main_option,volume_option,drawData;
            if(this.nowType.type=="MIN"||this.nowType.type=="DAY2"){
                //分时
                var obj = {
                    close:this.item.close,unit:this.item.unit,type:this.nowType.type
                };
                drawData = Tool.parseLinedata(this.nowType.sourceData,obj);
                main_option = this.configLine();
                main_option.xAxis.data = drawData.categoryData;
                main_option.series[0].data = drawData.values;
                main_option.yesterdayEnd = obj.close;

                volume_option = this.configVolume2();
                volume_option.series[1].data = drawData;
                console.log("绘图line");
                if(this.nowType.type=="DAY2") {
                    main_option.sub_type = 'two_line';
                    volume_option.sub_type = 'two_line';
                } else {
                    main_option.sub_type = 'min_line';
                    volume_option.sub_type = 'min_line';
                }
                jdschart.go(document.getElementById('kline2Volume'),volume_option);
                jdschart.go(document.getElementById('kline2'),main_option);
            }else{
                drawData = Tool.parseKlineData(this.nowType.sourceData);//取了一部分用来画图
                main_option = this.configKline();
                main_option.xAxis.data = drawData.categoryData;
                main_option.series[1].data = drawData.values;
                volume_option = this.configVolume();
                volume_option.series[1].data = drawData;
                console.log("绘图kline",drawData.categoryData.length);
                jdschart.go(document.getElementById('JdsChart_klineVolume'),volume_option);
                jdschart.go(document.getElementById('JdsChart_kline'),main_option);
            }
            // 先注释掉了
            // volume_option = this.configVolume();
            // volume_option.series[1].data = drawData;
            // jdschart.go(document.getElementById('JdsChart_klineVolume'),volume_option);
            // jdschart.go(document.getElementById('JdsChart_kline'),main_option);
            
        },
        getHistoryData(){
            var type = this.nowType.type;
            var self = this;
            if(type=="MIN"){
                //单独的分时不需要请求历史
                if(this.nowType.sourceData.length==0){
                    this.min();//订阅分时
                }
            }else{
                var url = this.historyUrl;
                if(this.nowType.type=="DAY2"){
                    url+="&servicetype=MIN";
                }else{
                    url+="&servicetype=KLINE";
                }
                url+="&market="+encodeURIComponent(this.item.market);
                url+="&inst="+encodeURIComponent(this.item.inst);
                url+="&period="+this.nowType.type;
                url+="&starttime="+this.getStartTime();
                url+="&endtime="+this.getEndTime();
                url+="&limit="+this.nowType.limit;
                url+="&callback=?"
              
            //   this.$http.jsonp(url).then(res=>res.json()).then(function(res) {
            //     if(type=="DAY2"){
            //       this.nowType.endtime = res.MinData[0].Time;
            //       this.minYeaData = res.MinData;
            //       this.min();//订阅分时
            //     }else{
            //       this.nowType.endtime = res.KlineData[0].Time;
            //       this.nowType.sourceData = res.KlineData.concat(this.nowType.sourceData);
            //       this.kline();//订阅KLINE
            //     }
            //   });
                // if(type=="DAY2"&&this.minYeaData.length!=0){
                //     return;
                // }
                if(this.loadingData){
                    return;
                }
                this.loadingData = true;
                $.getJSON(url,function(res){
                    self.loadingData = false;
                    if(type=="DAY2"){
                        self.nowType.endtime = res.MinData[0].Time;
                        self.minYeaData = res.MinData;
                        self.getDrawData("min");
                        self.min();//订阅分时
                    }else{
                        self.nowType.endtime = res.KlineData[0].Time;
                        self.nowType.sourceData = res.KlineData.concat(self.nowType.sourceData);
                        self.getDrawData();
                        self.kline();//订阅KLINE
                    }
                })
            }
        },
        kline(){
            var preiod = this.nowType.type;
            var st = 0;
            if(preiod=="WEEK"||preiod=="MONTH"){
                st = 0;
            }else{
                st = this.getUnixTime(new Date());
            }
            var dataStr=JSON.stringify({
                Market:this.item.market,
                Inst:this.item.inst,
                ServiceType:"KLINE",
                Period:preiod,
                endtime:0,
                starttime:st,
                SubType:"SUBON"
            });
            this.ws.send(dataStr);
        },
        yesterday(){
            //昨结
            var dataStr=JSON.stringify({
                Market:this.item.market,
                Inst:this.item.inst,
                ServiceType:"STATISTICS",
                Period:"",
                SubType:"SUBON"
            });
            this.ws.send(dataStr);
        },
        unit(){
            //单位
            var dataStr=JSON.stringify({
                Market:this.item.market,
                Inst:this.item.inst,
                ServiceType:"STATIC",
                Period:"",
                SubType:"SUBON"
            });
            this.ws.send(dataStr);
        },
        min(){
            //先画再订阅分时，如果是停盘订阅不发数据
            var dataStr=JSON.stringify({
                Market:this.item.market,
                Inst:this.item.inst,
                ServiceType:"MIN",
                endtime:MaxEndTime,
                starttime:0,
                SubType:"SUBON"
            });
            this.ws.send(dataStr);
        },
        getStartTime(){
            if(this.nowType.endtime!=MaxEndTime){
                if(this.nowType.type!="MIN30"){
                    this.nowType.starttime = this.getUnixTime(Tool.getCalculateDate(new Date(this.nowType.endtime*1000),Math.abs(this.nowType.addDate),this.nowType.type,0));
                }else{
                    this.nowType.starttime = this.getUnixTime(Tool.getCalculateDate(new Date(this.nowType.endtime*1000),Math.abs(this.nowType.addDate),"min",0));
                }
            }
            return this.nowType.starttime;
        },
        getEndTime(){
            return this.nowType.endtime;
        },
        getUnixTime(date){
            //处理化时间取前10位
            var time_str = new Date(date).getTime().toString();
            return time_str.substr(0, 10);
        },
        initKChart: function() {
            var option = this.configKline();
            jdschart.go(document.getElementById('JdsChart_kline'),option);
        },
        initLChart: function() {
            var options = this.configLine();
            jdschart.go(document.getElementById('kline2'),options);
        },
        initVolume: function() {
            console.log("渲染柱状图");
            var options = this.configVolume();
            jdschart.go(document.getElementById('JdsChart_klineVolume'),options);
        },
        configKline: function() {
            return {
                loadmoreData:function(){
                  console.log("我是一个loadmoreData方法")
                  window.kline.getHistoryData();
                },
                type: 'candlestick',
                title: {},
                size: {
                    width: 362,
                    height: 242
                },
                grid: {
                    show: true,
                    top: 2,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    rowNum: 5,
                    coloumNum: 4,
                    borderColor: "#ced4db",
                    borderWidth: 1,
                    backgroundColor: '#f22'
                },
                xAxis: {
                    show: true,
                    font: '10px Helvetica',
                    color: '#2e3033',
                    width: 90,
                    region: {
                        x: 4.5,
                        y: 245,
                        width: 362
                    },
                    splitNumber: 3,
                    //data: data.data3parse.categoryData
                },
                yAxis: {
                    show: true,
                    region: {
                        x: 0,
                        x_two: 320
                    },
                    font: '10px PingFangSC-Regular',
                    color: {
                        firstColor: '#2e3033',
                        secondColor: '#2e3033',
                        thirdColor: '#2e3033'
                    },
                    backgroundWidth: 0,
                    backgroundheight: this.state.offsetHeight,
                    backgroundColor: "rgba(255,255,255,0.8)"
                },
                series: [
                    {
                        name: '盈亏',
                        type: 'line',
                        smooth: true,
                        z: 3,
                        symbolSize:0,
                        lineStyle: {
                            normal: {
                                width: 4,
                                color: '#78C3FF'
                            }
                        },
                        //data:data.data1parse.values
                    },
                    {
                        name:'日K',
                        type:'candlestick',
                        //data:data.data3parse.values,
                        yAxisIndex: 1,
                        z:3,
                        barMaxWidth: '20%',
                        itemStyle: {
                            normal: {
                                color: 'white',
                                color0: '#1dbf60',
                                borderColor: 'red',
                                borderColor0:'green',
                                borderWidth:3
                            }
                        }
                    }
                ],
                zlevel: 50,
                Hline: {
                    color: "#2cbbb6a",
                    lineStyle: "dashed",
                    lineWidth: "1px",
                    region: {
                        x: 0,
                        y: 280
                    }
                },
                //leftPrice: {
                //    font: '10px PingFangSC-Regular',
                //    color: '#2e3033',
                //    backgroundWidth: 0,
                //    backgroundheight: this.state.offsetHeight,
                //    backgroundColor: "rgba(255,255,255,0.8)",
                //    region: {
                //        x: 0//紧贴左边框
                //    }
                //},
                riseColor: '#c80a0a',
                fallColor: '#036906',
                kborderColor: '#c80a0a',
                kborderColor0: '#036906',
                region: { x: 0, y: 0, width: 362, height: 230 }, //主绘图区域
                barWidth: 5,
                spaceWidth: 2.5,
                //horizontalLineCount: 5,
                // lineWidth: 1,
                MAs: [
                    { color: 'rgb(255,0,255)', daysCount: 5 },
                    { color: 'rgb(255,165,0)', daysCount: 10 },
                    { color: 'rgb(30,144,255)', daysCount: 20 }
                ],
                volume:{
                    x:0,
                    y:300,
                    height:80,
                    width:240
                },
                domId: 'kline',
                correlationDomId:'JdsChart_klineVolume',
                endurance:function(){}
            };
        },
        configLine: function() {
            return {
                type: 'line',
                sub_type: '',
                size: {
                    width: 362,
                    height: 287
                },
                grid: {
                    show: true,
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    rowNum: 5,
                    coloumNum: 4,
                    borderColor: "#ced4db",
                    borderWidth: 1,
                    backgroundColor: '#f22'
                },
                horizontalLineCount: 5,
                Hline: {
                    color: "#ccc",
                    lineStyle: "dashed",
                    lineWidth: "1px",
                    region: {
                        x: 0,
                        y: 280
                    }
                },
                //leftPrice: {
                //    font: '10px Helvetica',
                //    color: '#2e3033',
                //    backgroundWidth: 80,
                //    backgroundheight: 270,
                //    backgroundColor: "rgba(255,255,255,0.2)",
                //    region: {
                //        x: 0
                //    }
                //},
                region: { x: 0, y: 0, width: 362, height: 275 },
                xAxis: {
                    show: true,
                    font: '8px Helvetica', //
                    color: '#2e3033',
                    width: 90,
                    region: {
                        x: 4.5,
                        y: 286,
                        width: 362
                    },
                    splitNumber: 3,
                    //data: data.data1parse.categoryData
                },
                yAxis: {
                    show: true,
                    region: {
                        x: 0,
                        x_two: 320
                    },
                    font: '10px PingFangSC-Regular',
                    color: {
                        firstColor: '#ff0000',
                        secondColor: '#2e3033',
                        thirdColor: '#009800'
                    },
                    backgroundWidth: 0,
                    backgroundheight: this.state.offsetHeight,
                    backgroundColor: "rgba(255,255,255,0.8)",
                },
                series: [
                    {
                        name: '盈亏',
                        type: 'line',
                        smooth: true,
                        z: 3,
                        symbolSize:0,
                        lineStyle: {
                            normal: {
                                width: 4,
                                color: '#78C3FF'
                            }
                        },
                        //data:data.data1parse.values
                    }
                ],
                yesterdayEnd: 200,
                zlevel: 30,
                domId: 'kline2'
            }
        },
        configVolume: function() {
            return {
                type: 'bar',
                size: {
                    width: 362,
                    height: 100
                },
                grid: {
                    show: true,
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    rowNum: 3,
                    coloumNum: 4,
                    borderColor: "#ced4db",
                    borderWidth: 1,
                    backgroundColor: '#f22'
                },
                zlevel: 50,
                Hline: {
                    color: "#2cbbb6a",
                    lineStyle: "dashed",
                    lineWidth: "1px",
                    region: {
                        x: 0,
                        y: 280
                    }
                },
                region: { x: 0, y: 0, width: 362, height: 100 },
                barWidth: 5,
                spaceWidth: 2.5,
                yAxis: {
                    show: true,
                    region: {
                        x: 0,
                        x_two: 320
                    },
                    font: '10px PingFangSC-Regular',
                    color: {
                        firstColor: '#2e3033',
                        secondColor: '#2e3033',
                        thirdColor: '#2e3033'
                    },
                    backgroundWidth: 0,
                    backgroundheight: this.state.offsetHeight,
                    backgroundColor: "rgba(255,255,255,0.8)"
                },
                volume:{
                    x:0,
                    y:300,
                    height:80,
                    width:240
                },
                //leftPrice: {
                //    font: '10px PingFangSC-Regular',
                //    color: '#2e3033',
                //    backgroundWidth: 0,
                //    backgroundheight: this.state.offsetHeight,
                //    backgroundColor: "rgba(255,255,255,0.8)",
                //    region: {
                //        x: 0//紧贴左边框
                //    }
                //},
                series: [{},{
                    name: '盈亏',
                    type: 'bar',
                    smooth: true,
                    z: 3,
                    symbolSize:0,
                    itemStyle: {
                        riseColor: '#c80a0a',
                        fallColor: '#036906'
                    },
                    lineStyle: {
                        normal: {
                            width: 4,
                            color: '#78C3FF'
                        }
                    },
                    data:data.data3parse
                }],
                correlationDomId:'JdsChart_kline',
            }
        },
        configVolume2: function() {
            return {
                type: 'volume',
                size: {
                    width: 362,
                    height: 100
                },
                grid: {
                    show: true,
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    rowNum: 3,
                    coloumNum: 4,
                    borderColor: "#ced4db",
                    borderWidth: 1,
                    backgroundColor: '#f22'
                },
                zlevel: 50,
                Hline: {
                    color: "#2cbbb6a",
                    lineStyle: "dashed",
                    lineWidth: "1px",
                    region: {
                        x: 0,
                        y: 280
                    }
                },
                region: { x: 0, y: 0, width: 362, height: 100 },
                barWidth: 0.5,
                spaceWidth: 0.1,
                yAxis: {
                    show: true,
                    region: {
                        x: 0,
                        x_two: 320
                    },
                    font: '10px PingFangSC-Regular',
                    color: {
                        firstColor: '#2e3033',
                        secondColor: '#2e3033',
                        thirdColor: '#2e3033'
                    },
                    backgroundWidth: 0,
                    backgroundheight: this.state.offsetHeight,
                    backgroundColor: "rgba(255,255,255,0.8)"
                },
                volume:{
                    x:0,
                    y:300,
                    height:100,
                    width:240
                },
                //leftPrice: {
                //    font: '10px PingFangSC-Regular',
                //    color: '#2e3033',
                //    backgroundWidth: 0,
                //    backgroundheight: this.state.offsetHeight,
                //    backgroundColor: "rgba(255,255,255,0.8)",
                //    region: {
                //        x: 0//紧贴左边框
                //    }
                //},
                series: [{},{
                    name: '盈亏',
                    type: 'bar',
                    smooth: true,
                    z: 3,
                    symbolSize:0,
                    itemStyle: {
                        riseColor: '#c80a0a',
                        fallColor: '#036906'
                    },
                    lineStyle: {
                        normal: {
                            width: 4,
                            color: '#78C3FF'
                        }
                    },
                    data:data.data3parse
                }]
            }
        },
        each: function(obj, cb, dev) {
        if(! (obj && cb)) {
            return;
        }
        if(obj.forEach && obj.forEach === nativeForEach) {
            obj.forEach(cb, dev);
        } else if (obj.length === +obj.length) {//shuzu
            for(var i = 0, len = obj.length;i < len; i++){
                cb.call(dev, obj[i], i, obj);
            }
        } else {//duixiang
            for(var key in obj) {
                if(obj.hasOwnProperty(key)) {
                    cb.call(dev, obj[key], key, obj);
                }
            }
        }
    }
    };
    exports.kline = kline;
});

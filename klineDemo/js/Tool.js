define(function(require, exports, module){
  var Tool = {
    wsurl(){
        return "ws://websocket-quote2.jince.com:9997/quote";
    },
    parseLinedata(data,obj) {
        //data是原数据，obj是用来计算的（close:昨结,unit:单位,type:类型）
        var linedatas=[];
        var tmpKlineChartData = {
            categoryData: [],//横轴数据，时间
            values: [], //纵轴数据，高开低收
            timestamp: [], //时间戳
            barVolume: []
        };
        var linetime = [];
        var linebar = [];
        var yesterday = 1;
        for (var i =0;i<data.length;i++) {
            //获取时间,价格，收盘，最低，最高数据，并存储到临时变量
            var tmp_volume=0,tmp_amount=0,avg_price=0,tmp_color= 0,highlow=0;
            if(i==0){
                tmp_volume = data[i].Volume;
                tmp_amount = data[i].Amount;
                if(obj.type=="MIN"){
                    if(data[i].Price>obj.close){
                        tmp_color = 1;
                    }else if(data[i].Price<obj.close){
                        tmp_color = -1;
                    }else{
                        tmp_color = 0;
                    }
                }else{
                    tmp_color = 0;
                }

            }
            else{
                tmp_volume = data[i].Volume - data[i-1].Volume;
                tmp_amount = data[i].Amount - data[i-1].Amount;
                if(data[i].Price>data[i-1].Price){
                    tmp_color = 1;
                }else if(data[i].Price<data[i-1].Price){
                    tmp_color = -1;
                }else{
                    tmp_color = 0;
                }
                if(tmp_volume<0){
                    yesterday = 0;
                    tmp_volume = data[i].Volume;
                    tmp_amount = data[i].Amount;
                    if(data[i].Price>obj.close){
                        tmp_color = 1;
                    }else if(data[i].Price<obj.close){
                        tmp_color = -1;
                    }else{
                        tmp_color = 0;
                    }
                }
                //highlow = (data[i].Price - obj.close)/obj.close;
            }
            highlow = (data[i].Price - obj.close) / obj.close;
            avg_price = data[i].Amount/data[i].Volume/obj.unit;
            var item = [this.getTimeStr(data[i].Time,'minute'),data[i].Price,tmp_volume,tmp_amount,avg_price,tmp_color,yesterday,highlow];
            linedatas.push(item);
            linetime.push(data[i].Time);
            linebar.push(tmp_volume);
        }
        //格式化为chart数据
        return this.splitData(linedatas, linetime, tmpKlineChartData, linebar);
    },
    parseKlineData(data){
        var tmpKlineChartData = {
            categoryData: [],//横轴数据，时间
            values: [], //纵轴数据，高开低收
            timestamp: [], //时间戳
            barVolume: []
        };
        var klinedatas=[];
        var klinebar = [];
        var klinetime = [];
        //data = eval(data.KlineData);
        for (var i=0;i<data.length;i++) {
            //获取时间,开盘，收盘，最低，最高数据，并存储到临时变量
            var item = [this.getTimeStr(data[i].Time),data[i].Open,data[i].Close,data[i].Low,data[i].High,data[i].Volume];
            klinedatas.push(item);
            klinetime.push(data[i].Time);
            klinebar.push(data[i].Volume);
        }
        //格式化为chart数据
        return this.splitData(klinedatas, klinetime, tmpKlineChartData, klinebar);
    },
    getTimeStr(tamp,type){
        var newDate = new Date();
        newDate.setTime(tamp*1000);
        type = type || 'day';
        return this.formatDate(newDate,type);
    },
    formatDate(inputDate,type){
        var   year=inputDate.getFullYear();
        var   month=inputDate.getMonth()+1;
        if(month<10){
            month = '0'+month;
        }
        var   date=inputDate.getDate();
        if(date<10){
            date = '0'+date;
        }
        var   hour=inputDate.getHours();
        if(hour<10){
            hour = '0'+hour;
        }
        var   minute=inputDate.getMinutes();
        if(minute<10){
            minute = '0'+minute;
        }
        var   second=inputDate.getSeconds();
        if(second<10){
            second = '0'+second;
        }
        if(type=="day"){
            return   year+'-'+month+'-'+date;
        }else if(type=="minute"){
            return hour+':'+minute;
        }
    },
    splitData(rawData, timeData, outData, barData){
        var categoryData = [];
        var values = [];
        var timestamp = [];
        var barVolume = [];
        for (var i = 0; i < rawData.length; i++) {
            //从rawData中删除日期，保存为横轴数据
            outData.categoryData.push(rawData[i].splice(0, 1)[0]);
            //将高开低收数据放入纵轴
            outData.values.push(rawData[i]);
            if(outData.barVolume){
                outData.barVolume.push(barData[i]);
            }
        }
        outData.timestamp = timeData;
        return outData;
    },
    getCalculateDate(startDate, num, type, category){
        //返回结束日期
        //startDate:需要计算的开始时间
        //num：计算的数值
        //type:计算的类型（day,hour,minute,second)
        //category:计算的类型（1表示加，0表示减）默认加
        var endatenum,stdate,addnum;
        var tmpyear = startDate.getFullYear();
        var tmpmonth = startDate.getMonth()*1+1;
        var tmpday = startDate.getDate();
        var tmphour = startDate.getHours();
        var tmpminute = startDate.getMinutes();
        var tmpsecond = startDate.getSeconds();
        type = type.toLocaleLowerCase();
        switch(type){
            case 'year':
                stdate = new Date(tmpyear+"/"+tmpmonth+"/"+tmpday).valueOf();
                addnum = num * 1000 * 3600 * 24 * 365;
                break;
            case 'month':
                stdate = new Date(tmpyear+"/"+tmpmonth+"/"+tmpday).valueOf();
                addnum = num * 1000 * 3600 * 24 * 30;
                break;
            case 'week':
                stdate = new Date(tmpyear+"/"+tmpmonth+"/"+tmpday).valueOf();
                addnum = num * 1000 * 3600 * 24 * 7;
                break;
            case 'day':
                stdate = new Date(tmpyear+"/"+tmpmonth+"/"+tmpday).valueOf();
                addnum = num * 1000 * 3600 * 24;
                break;
            case 'hour':
                stdate = new Date(tmpyear+"/"+tmpmonth+"/"+tmpday+" "+tmphour+":00:00").valueOf();
                addnum = num * 1000 * 3600;
                break;
            case 'minute':
                stdate = new Date(tmpyear+"/"+tmpmonth+"/"+tmpday+" "+tmphour+":"+tmpminute+":00").valueOf();
                addnum = num * 1000 * 60;
                break;
            case 'second':
                stdate = new Date(tmpyear+"/"+tmpmonth+"/"+tmpday+" "+tmphour+":"+tmpminute+":"+tmpsecond).valueOf();
                addnum = num * 1000 * 60;
                break;
        }
        if (category * 1 == 0) {
            endatenum = stdate - addnum;
        } else {
            endatenum = stdate + addnum;
        }
        
        return new Date(endatenum);
    }
  }
  module.exports = Tool;

});
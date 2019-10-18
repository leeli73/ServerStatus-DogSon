var Config = require('../conf/conf')
const log = {
    info: function(msg){
        if(Config.LogLevel == "INFO")
        {
            console.log('\x1b[97m',this.getNow() + ": ",msg)
        }
    },
    warn: function(msg){
        if(Config.LogLevel == "INFO" || Config.LogLevel == "ERROR")
        {
            console.log('\x1b[93m',this.getNow() + ": ",msg)
        }
    },
    error: function(msg){
        if(Config.LogLevel == "INFO" || Config.LogLevel == "ERROR")
        {
            console.log('\x1b[91m',this.getNow() + ": ",msg)
        }
    },
    print: function(msg){
        console.log('\x1b[97m',this.getNow() + ": ",msg)
    },
    getNow: function(){
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        if(hour < 10)
        {
            hour = "0" + hour
        }
        if(minute < 10)
        {
            minute = "0" + minute
        }
        if(second < 10)
        {
            second = "0" + second
        }
        return year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second
    }
}
module.exports = log;

const os = require('os');
const Config = require('./conf/conf')
const log = require('./utils/log')
const child_process = require('child_process')
const Step = require('./utils/Step')
const StringUtil = require('./utils/stringutil')
var request = require('request');
var History = function(_rx,_tx){
    this.rx = _rx
    this.tx = _tx
}
var Status = new Object()
function getCPUInfo()
{
    Status.load = os.loadavg()[0]
    Status.cpu = os.cpus.length
}
function getMemoryInfo()
{
    Status.memory_total = os.totalmem()
    Status.memory_used = os.freemem()
}
function getSystemInfo()
{
    var date = new Date(os.uptime())
    Status.uptime = date.getDay() + "天"
}
function getHddInfo(callback)
{
    child_process.exec("df",function(error,stdout,stderr){
        var lines = stdout.split("\n")
        lines.forEach(line => {
            var tempData = line.split(" ")
            for(var i=0;i<tempData.length;i++)
            {
                if(tempData[i] == "/")
                {
                    callback(tempData[i-5],tempData[i-4])
                    break
                }
            }
        });
    })
}
function getSwapInfo(callback)
{
    child_process.exec("free",function(error,stdout,stderr){
        var lines = stdout.split("\n")
        lines.forEach(line => {
            var temp = line.split(" ")
            if(temp[0] == "Swap:" || temp[0] == "交换分区:")
            {
                var allData = new Array()
                temp.forEach(key => {
                    if(key != "")
                    {
                        allData.push(key)
                    }
                })
                callback(allData[1],allData[2])
            }
        })
    })
}
function getNetInfo(callback)
{
    child_process.exec("cat /proc/net/dev | grep eth0 | sed 's/:/ /g' | awk '{print $2}' && cat /proc/net/dev | grep eth0 | sed 's/:/ /g' | awk '{print $10}'",function(error,stdout,stderr){
        var lines = stdout.split("\n")
        var RX_Out = lines[0]
        var TX_In = lines[1]
        var RX = parseInt(RX_Out) - parseInt(History.RX)
        var TX = parseInt(TX_In) - parseInt(History.TX)
        callback(RX,TX,RX_Out,TX_In)
    })
}
function hddNext(total,used)
{
    Status.hdd_total = total
    Status.hdd_used = used
    getSwapInfo(swapNext)
}
function swapNext(total,used)
{
    Status.swap_total = total
    Status.swap_used = used
    getNetInfo(netNext)
}
function netNext(rx,tx,_in,_out)
{
    Status.network_rx = rx
    Status.network_tx = tx
    Status.network_in = _in
    Status.network_out = _out
    Send2Server()
}
function netNextHistory(rx,tx,_in,_out)
{
    History.RX = rx
    History.TX = tx
}
function Send2Server()
{
    var requestData = "username="+ Config.username + "&password=" + Config.password + "&data=" + StringUtil.toBase64(JSON.stringify(Status))
    request({
        url: "http://" + Config.ServerIP + ":" + Config.ServerPort + "/work",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: requestData
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            log.info("Send to Server Success!")
        }
        else
        {
            log.warn("Send to Server Error!");
        }
    });
}
if(os.platform == "win32")
{
    log.error("ServerStatus-DogSon Client 暂不支持Windows服务器！")
    return 
}
History.RX = 0
History.TX = 0
getNetInfo(netNextHistory)
setInterval(() => {
    Step.Step(
        getCPUInfo(),
        getMemoryInfo(),
        getSystemInfo(),
        getHddInfo(hddNext)
    )
}, 2000);
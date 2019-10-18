var fs = require('fs')
var path = require('path')
var http = require('http');
var Config = require('./conf/conf')
var ContentType = require('./lib/contenttype')
var log = require('./utils/log')
const querystring = require('querystring')
var StringUtil = require('./utils/stringutil')

var info = function(){
    this.name,
    this.type,
    this.host,
    this.location,
    this.online4 = false,
    this.online6 = false,
    this.uptime,
    this.load,
    this.network_rx,
    this.network_tx,
    this.network_in,
    this.network_out,
    this.cpu,
    this.memory_total,
    this.memory_used,
    this.swap_total,
    this.swap_used,
    this.hdd_total,
    this.hdd_used,
    this.custom = "",
    this.region,
    this.username,
    this.password
}
var servers = new Array()

function readConfig(){
    fs.readFile("conf/data.json",initConfig)
}
function initConfig(err,_data){
    var data = JSON.parse(_data)
    for(var i = 0;i<data.servers.length;i++)
    {
        var temp = new info()
        temp.name = data.servers[i].name
        temp.type = data.servers[i].type
        temp.host = data.servers[i].host
        temp.location = data.servers[i].location
        temp.username = data.servers[i].username
        temp.password = data.servers[i].password
        temp.region = data.servers[i].region
        servers.push(temp)
    }
}
function write2WebDir() {
    var res = new Object()
    res.servers = servers
    res.uptime = Date.now()
    fs.writeFile(Config.WebDir + path.sep + "json" + path.sep + "stats.json", JSON.stringify(res) , function (err) {
        if (err) {
            log.error("Write Stats.json File with Error!")
        }
        log.info("Write Stats.json File Success!")
    });
}

http.createServer(function(request, response){
    if(request.url === "/admin")
    {

    }
    else if(request.url === "/work" && request.method === "POST")
    {
        var data = '';
        request.on('data', function (chunk) {
            data += chunk;
        });
        request.on('end', function () {
            data = decodeURI(data);
            var dataObject = querystring.parse(data);
            var recInfo = JSON.parse(StringUtil.toStr(dataObject.data))
            for(var i = 0;i<servers.length;i++)
            {
                if(dataObject.username == servers[i].username && dataObject.password == servers[i].password)
                {
                    servers[i].load = recInfo.load
                    servers[i].cpu = recInfo.cpu
                    servers[i].memory_total = recInfo.memory_total
                    servers[i].memory_used = recInfo.memory_used
                    servers[i].uptime = recInfo.uptime
                    servers[i].hdd_total = recInfo.hdd_total
                    servers[i].hdd_used = recInfo.hdd_used
                    servers[i].swap_total = recInfo.swap_total
                    servers[i].swap_used = recInfo.swap_used
                    servers[i].network_rx = recInfo.network_rx
                    servers[i].network_tx = recInfo.network_tx
                    servers[i].network_in = recInfo.network_in
                    servers[i].network_out = recInfo.network_out
                    servers[i].online4 = true
                    break
                }
            }
        });
        response.writeHead(200, { 'Content-Type': "text/html"});
        response.end()
    }
    else
    {
        if(request.url == "/")
        {
            fs.readFile(Config.WebDir + path.sep + request.url + "index.html",function(err,data){
                if(err)
                {
                    log.warn("Can't read file <" + request.url + "> Status:404")
                    response.writeHead(404)
                }
                else
                {
                    log.info("Read file <" + request.url + "> Status:200")
                    response.writeHead(200, { 'Content-Type': ContentType.getContentType(path.extname(Config.WebDir + path.sep + request.url + "index.html")) });
                    response.end(data)
                }
            })
        }
        else
        {
            fs.readFile(Config.WebDir + path.sep + request.url,function(err,data){
                if(err)
                {
                    log.warn("Can't read file <" + request.url + "> Status:404")
                    response.writeHead(404)
                }
                else
                {
                    log.info("Read file <" + request.url + "> Status:200")
                    response.writeHead(200, { 'Content-Type': ContentType.getContentType(path.extname(Config.WebDir + path.sep + request.url)) });
                    response.end(data)
                }
            })
        }
    }
}).listen(Config.Port,Config.Hostname);
log.print("Server Listening Address " + Config.Hostname + ":" + Config.Port)
readConfig()
setInterval(() => {
    write2WebDir()
}, 2000);

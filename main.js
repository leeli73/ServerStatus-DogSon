var fs = require('fs')
var path = require('path')
var http = require('http');
var Config = require('./conf/conf')
var ContentType = require('./lib/contenttype')
var log = require('./utils/log')
const querystring = require('querystring')
var StringUtil = require('./utils/stringutil')
const urllib = require('url');

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
var now_indentity = function(){
    data = ""
    activeTime = 0
}

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
function randomString(len) {
    len = len || 32;
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}
function checkIndentity(){
    var now = new Date().getTime()
    if(now - now_indentity.activeTime > 30000)
    {
        now_indentity.data = ""
        now_indentity.activeTime = 0
        log.info("Delete Indentity Code!")
    }
    else
    {
        now_indentity.activeTime = new Date().getTime()
    }
}

http.createServer(function(request, response){
    if(request.url.substring(0,6) === "/admin")
    {
        var obj = urllib.parse(request.url,true);
        if(request.method === "GET")
        {
            if(obj.query.id != undefined && now_indentity.data != "" && obj.query.id == now_indentity.data)
            {
                fs.readFile(Config.WebDir + path.sep + "admin.html",function(err,data){
                    if(err)
                    { + 
                        log.warn("Can't read file <admin.html> Status:404")
                        response.writeHead(404)
                    }
                    else
                    {
                        log.info("Read file <admin.html> Status:200")
                        response.writeHead(200, { 'Content-Type': ContentType.getContentType(path.extname(Config.WebDir + path.sep + "admin.html")) });
                        checkIndentity(obj.query.id)
                        response.end(data)
                    }
                })
            }
            else
            {
                fs.readFile(Config.WebDir + path.sep + "login.html",function(err,data){
                    if(err)
                    {
                        log.warn("Can't read file <login.html> Status:404")
                        response.writeHead(404)
                    }
                    else
                    {
                        log.info("Read file <login.html> Status:200")
                        response.writeHead(200, { 'Content-Type': ContentType.getContentType(path.extname(Config.WebDir + path.sep + "login.html")) });
                        checkIndentity()
                        response.end(data)
                    }
                })
            }
        }
        else if(request.method === "POST")
        {
            var data = ''
            request.on('data', function (chunk) {
                data += chunk;
            });
            request.on('end', function () {
                data = decodeURI(data);
                data = JSON.parse(data)
                if(obj.query.id != undefined && now_indentity.data != "" && obj.query.id != now_indentity.data && data.type != "login")
                {
                    response.end("Error!")
                    return
                }
                if(data.type == "login")
                {
                    if(data.password == Config.AdminPassword)
                    {
                        now_indentity.data = randomString(32)
                        now_indentity.activeTime = new Date().getTime()
                        response.end(now_indentity.data)
                        log.info("Admin Login Success")
                    }
                    else
                    {
                        response.end("error")
                        log.info("Admin Login Failed")
                    }
                }
                else if(data.type == "saveServer")
                {
                    var temp = new Object()
                    temp.servers = JSON.parse(data.data)
                    fs.writeFile("conf" + path.sep + "data.json", JSON.stringify(temp) , function (err) {
                        if (err) {
                            log.error("Write data.json File with Error!")
                            response.end("error")
                        }
                        else
                        {
                            log.info("Write data.json File Success!")
                            readConfig()
                        }
                    });
                }
                else if(data.type == "getServer")
                {
                    checkIndentity()
                    fs.readFile("conf" + path.sep + "data.json",function(err,data){
                        if(err)
                        {
                            log.warn(err)
                            log.warn("Can't read file <" + "data.json" + "> Status:404")
                            response.writeHead(404)
                            response.end("error")
                        }
                        else
                        {
                            log.info("Read file <" + "data.json" + "> Status:200")
                            response.writeHead(200, { 'Content-Type': ContentType.getContentType("conf" + path.sep + "data.json") });
                            response.end(data)
                        }
                    })
                }
            })
        }
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
        if(request.url == "/login.html" || request.url == "/admin.html")
        {
            log.info("Someone Want to Read admin Page!")
            response.statusCode = 404
            response.writeHead(404)
            return
        }
        if(request.url == "/")
        {
            fs.readFile(Config.WebDir + path.sep + request.url + "index.html",function(err,data){
                if(err)
                {
                    log.warn("Can't read file <" + request.url + "> Status:404")
                    response.statusCode = 404
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
                    response.statusCode = 404
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

const fs = require('fs')
var info = function(){
    this.name,
    this.type,
    this.host,
    this.location,
    this.online4,
    this.online6,
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
    this.custom,
    this.region,
    this.username,
    this.password
}
var stats = function(){
    this.servers = new Array()
    this.updated = 0
}
function readConfig(){
    fs.readFile("conf/data.json",initConfig)
}
function initConfig(err,data){
    var data = JSON.parse(data)
    for(var i = 0;i<data.servers.length;i++)
    {
        var temp = new info()
        temp.name = data.servers[i].name
        temp.type = data.servers[i].type
        temp.host = data.servers[i].host
        temp.location = data.servers[i].location
        temp.username = data.servers[i].username
        temp.password = data.servers[i].password
        stats.push(temp)
    }
}
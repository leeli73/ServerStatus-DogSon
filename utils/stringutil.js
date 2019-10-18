const StringUtil = {
    between: function(str,key1,key2){
        var m = str.match(new RegExp(key1+'(.*?)'+key2))
        return m ? m[ 1 ] : false;
    },
    trim: function(str){
        str = str.replace(/(^\s*)|(\s*$)/g, "");
        return str
    },
    toBase64: function(str){
        var res = new Buffer(str).toString('base64');
        return res
    },
    toStr: function(str){
        var res = new Buffer(str, 'base64').toString();
        return res
    }
}
module.exports = StringUtil
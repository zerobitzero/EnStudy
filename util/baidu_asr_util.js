var request = require('request');

var expireTime = 86400;

var Util = {
    getToken: getToken,
    createTimeStamp: createTimeStamp,
    isExpireTimeOut: isExpireTimeOut
};

function getToken(config, _callback) {
    console.log(config);
    var obj = {};

    if (!config.appKey || !config.secretKey) {
        obj = {
            err: true,
            msg: 'appKey 或者secretKey为空！，请填写config/config.js的相关字段'
        };
        _callback(obj);
    }

    var url = 'https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + config.appKey + '&client_secret=' + config.secretKey;
    console.log(url);
    var _requestToken = function (config, callback) {
        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                config.cached = JSON.parse(body);
                config.cached.timestamp = createTimeStamp();
                callback({
                    err: false,
                    data: config.cached
                });
            } else {
                callback({
                    err: true,
                    msg: '获取access_token失败'
                });
            }
        });
    }

    if (config.cached && config.cached.timestamp) {
        var ts = config.cached.timestamp;
        if (isExpireTimeOut(ts)) {
            _requestToken(config, function (result) {
                _callback(result);
            });
        } else {
            obj = {
                err: false,
                data: config.cached
            }
            _callback(obj);
        }
    } else {
        _requestToken(config, function (result) {
            _callback(result);
        });
    }
}

function createTimeStamp() {
    return '' + parseInt(new Date().getTime() / 1000);
}

function isExpireTimeOut(ts) {
    if (!ts) {
        throw '请传入参数ts';
    }
    return !!(createTimeStamp() - ts > expireTime);
}

module.exports = Util;

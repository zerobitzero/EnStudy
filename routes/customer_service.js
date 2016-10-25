/**
 * Created by zs on 16/10/23.
 */

var request = require('request');
var events = require('events');
var emitter = new events.EventEmitter();
var util = require('../util/util');

var config = require('../config/config');
var aotuConfig = config.wx_config.aotu;
var baiduAsrConfig = config.wx_config.baidu_asr;
var dialog = require('../config/dialog')
var timeout = 100;

var scores = [
    90,
    91,
    92,
    93,
    94,
    95,
    96,
    97,
    98,
    99,
    100
];
//
var CustomService = function () {
    this.data = '';
    this.msgType = 'text';
    this.fromUserName = '';
    this.toUserName = '';
    this.funcFlag = 0;
    this.users = [];
}

CustomService.prototype.dialogEvent = function () {
    emitter.on('dialog', function (input) {
        console.log('on dialog');
        console.log(input);
        var self = this;
        var access_token = input.access_token;
        var msg = input.msg;
        var sendVoice = input.sendVoice;

        var item = dialog[0];
        //console.log('item:', item);
        console.log(self.users);
        var index = self.users[msg.fromUserName].index;
        //console.log(index);
        var itemChild = item.data[index];
        console.log(itemChild);

        var voiceMsg = {
            "touser": msg.fromUserName,
            "msgtype": "voice",
            "voice": {
                "media_id": itemChild['media_id']
            }
        };
        self.sendNormalMsg(access_token, voiceMsg, function (result) {
            var textMsg = {
                "touser": msg.fromUserName,  // openid
                "msgtype": "text",
                "text": {
                    "content": itemChild['content']
                }
            };
            self.sendNormalMsg(access_token, textMsg, function (result) {

            });
        });
    });
}

CustomService.prototype.dialog = function (input) {
    //console.log('dialog');
    //console.log(input);
    var self = this;
    var access_token = input.access_token;
    var msg = input.msg;
    var sendAll = input.sendAll;

    var item = dialog[0];
    //console.log('item:', item);
    console.log(self.users);
    var index = self.users[msg.fromUserName].index;
    //console.log(index);
    var itemChild = item.data[index];
    //console.log(itemChild);

    if (sendAll) {
        var voiceMsg = {
            "touser": msg.fromUserName,
            "msgtype": "voice",
            "voice": {
                "media_id": itemChild['media_id']
            }
        };
        self.sendNormalMsg(access_token, voiceMsg, function (result) {
            setTimeout(function () {
                var textMsg = {
                    "touser": msg.fromUserName,  // openid
                    "msgtype": "text",
                    "text": {
                        "content": itemChild.role + ": \n" + itemChild.content
                    }
                };
                self.sendNormalMsg(access_token, textMsg, function (result) {
                    var newIndex = index + 1;
                    if (newIndex < item.data.length) {
                        self.users[msg.fromUserName].index = newIndex;
                        var preRole = itemChild.role;
                        var nowRole = item.data[newIndex].role;
                        if (nowRole == preRole && nowRole == 'Librarian') {
                            input.sendAll = true;
                            self.dialog(input);
                        } else {
                            input.sendAll = false;
                            self.dialog(input);
                        }
                        //console.log('input: ', input);
                        //console.log('preRole: ', preRole);
                        //console.log('nowRole: ', nowRole);
                    } else {
                        // TODO: end dialog
                        console.log('end');
                        var textMsg = {
                            "touser": msg.fromUserName,  // openid
                            "msgtype": 'text',
                            "text": {
                                "content": "已经结束本次会话,重新开始请输入study指令"
                            }
                        };
                        self.sendNormalMsg(access_token, textMsg, function (result) {

                        });
                    }
                });
            }, timeout);
        });
    } else {
        var textMsg = {
            "touser": msg.fromUserName,  // openid
            "msgtype": "text",
            "text": {
                "content": "[请你读]" + itemChild.role + ": \n" + itemChild.content
            }
        };
        self.sendNormalMsg(access_token, textMsg, function (result) {

        });
    }
}

CustomService.prototype.onStartEvent = function (msg) {
    console.log('onStartEvent');

    var self = this;

    self.users[msg.fromUserName] = {
        index: 0,
        processing: true,
        finished: false
    };

    console.log(this.users);

    util.getToken(aotuConfig, function (result) {
        if (result.err) {
            // TODO: 这儿目前是没有res的
            //self.res.status(timeout).send(result.msg);
        } else {
            var access_token = result.data.access_token;
            console.log('access_token', access_token);

            var input = {
                msg: msg,
                access_token: access_token,
                sendAll: true
            }
            //emitter.emit('dialog', input);
            //console.log('emit dialog');
            self.dialog(input);
        }
    });
}

CustomService.prototype.onNewMsg = function (msg) {
    console.log('onNewMsg');
    console.log(msg);
    var self = this;
    util.getToken(aotuConfig, function (result) {
        if (result.err) {
            // TODO: 这儿目前是没有res的
            //self.res.status(timeout).send(result.msg);
        } else {
            var access_token = result.data.access_token;
            console.log('access_token', access_token);

            if (self.users[msg.fromUserName] == undefined) {
                // TODO:abort
                // 发送空指令
                return;
            }

            var input = {
                'access_token': access_token,
                'media_id': msg.mediaId,
            };
            var item = dialog[0];
            var index = self.users[msg.fromUserName].index;
            var itemChild = item.data[index];

            voiceDownload(input, function (succeed, data) {
                    if (succeed) {
                        if (itemChild.role == 'Student') {
                            var standard = [
                                itemChild.content
                            ];

                            var input = {
                                msg: msg,
                                access_token: access_token,
                                sendAll: false
                            }
                            // TODO: 校验所讲是否ok
                            var score = getScore(standard, data);
                            if (score >= 60) {
                                var textMsg = {
                                    "touser": msg.fromUserName,  // openid
                                    "msgtype": 'text',
                                    "text": {
                                        "content": "本次打分通过,分数为: " + score
                                    }
                                };
                                self.sendNormalMsg(access_token, textMsg, function (result) {

                                });

                                var newIndex = index + 1;
                                if (newIndex < item.data.length) {
                                    self.users[msg.fromUserName].index = newIndex;
                                    var preRole = itemChild.role;
                                    var nowRole = item.data[newIndex].role;

                                    if (nowRole == preRole) {
                                        input.sendAll = false;

                                        setTimeout(function () {
                                            self.dialog(input);
                                        }, timeout);
                                    } else {
                                        input.sendAll = true;
                                        setTimeout(function () {
                                            self.dialog(input);
                                        }, timeout);
                                    }
                                } else {
                                    // TODO: end dialog
                                    var textMsg = {
                                        "touser": msg.fromUserName,  // openid
                                        "msgtype": 'text',
                                        "text": {
                                            "content": "已经结束本次会话,重新开始请输入study指令"
                                        }
                                    };
                                    self.sendNormalMsg(access_token, textMsg, function (result) {

                                    });
                                }
                            } else {
                                // TODO: 给出打分并等重新讲
                                var textMsg = {
                                    "touser": msg.fromUserName,  // openid
                                    "msgtype": 'text',
                                    "text": {
                                        "content": "本次打分不通过,请重新讲"
                                    }
                                };
                                self.sendNormalMsg(access_token, textMsg, function (result) {

                                });
                                var input = {
                                    msg: msg,
                                    access_token: access_token,
                                    sendAll: false
                                }
                                self.dialog(input);
                            }
                        } else {
                            // TODO:abort
                            // 发送空指令
                        }
                    }
                    else {

                    }
                }
            );

            /*
             var input = {
             'access_token': access_token,
             'media_id': msg.mediaId,
             };
             self.voiceDownload(input, function (result) {

             });
             //self.sendTextMsg(msg)
             //self.sendTextMsg(msg)
             //self.sendTextMsg(msg)

             var textMsg = {
             "touser": msg.fromUserName,  // openid
             "msgtype": "text",
             "text": {
             "content": "Hello World"
             }
             }
             self.sendNormalMsg(access_token, textMsg, function (result) {

             });

             //var textMsg = {
             //    "touser":msg.fromUserName,  // openid
             //    "msgtype":"text",
             //    "text":
             //    {
             //        "content":"一起跳个舞"
             //    }
             //}
             //self.sendTextMsg(access_token, textMsg, function(result) {
             //
             //});
             //
             //var textMsg = {
             //    "touser":msg.fromUserName,  // openid
             //    "msgtype":"text",
             //    "text":
             //    {
             //        "content":"然后一起唱个歌"
             //    }
             //}
             //self.sendTextMsg(access_token, textMsg, function(result) {
             //
             //});

             var imageMsg = {
             "touser": msg.fromUserName,
             "msgtype": "image",
             "image": {
             "media_id": "3oqAc94N2p1eYbnlDsH1NMbZ5GBCy2erjntky_TaW0Mu6m-hy9PVAqFEtnIjeaKz"
             }
             }
             self.sendNormalMsg(access_token, imageMsg, function (result) {

             });
             var voiceMsg = {
             "touser": msg.fromUserName,
             "msgtype": "voice",
             "voice": {
             "media_id": "AeaCPG3ElMQwyncjf1qj9dILmrSBXt1lsaXQrNHgMVEXruDUykqohXH_qo5cCnYE"
             }
             }
             self.sendNormalMsg(access_token, voiceMsg, function (result) {

             });
             */
        }
    })
    ;
}

CustomService.prototype.sendTextMsg = function (access_token, msg, _callback) {
    console.log('sendTextMsg');

    var self = this;
    var url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' + access_token;
    console.log(url);
    //data = JSON.stringify(msg);
    //console.log(data);
    //
    //var op = {
    //    method:'post',
    //    headers: {
    //        'Content-Type':'application/x-www-form-urlencoded;charset=utf-8',
    //        'Content-Length':data.length
    //    }
    //};
    ////var req = request.post(url, {raw: msg});
    ////console.log(req);
    //var req = request(url, op, function(serverFeedback) {
    //    console.log(serverFeedback);
    //    //if (serverFeedback.statusCode == 200) {
    //    //    var body = "";
    //    //    serverFeedback.on('data', function (data) { body += data; })
    //    //        .on('end', function () { res.send(200, body); });
    //    //}
    //    //else {
    //    //    res.send(timeout, "error");
    //    //}
    //});
    //req.write(data + "\n");
    //req.end();

    var request = require('request');

    var options = {
        headers: {"Connection": "close"},
        url: url,
        method: 'POST',
        json: true,
        body: msg,
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log('----info------', data);
            _callback(true);
        } else {
            _callback(false);
        }
    }

    request(options, callback);
}

CustomService.prototype.sendNormalMsg = function (access_token, msg, _callback) {
    console.log('sendTextMsg');

    var self = this;
    var url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' + access_token;
    //console.log(url);

    var request = require('request');

    var options = {
        headers: {"Connection": "close"},
        url: url,
        method: 'POST',
        json: true,
        body: msg,
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log('----info------', data);
            _callback(true);
        } else {
            _callback(false);
        }
    }

    request(options, callback);
}

function voiceDownload(input, _callback) {
    console.log('voiceDownload');
    require('../util/baidu_asr_util').getToken(baiduAsrConfig, function (result) {
        if (result.err) {
            // TODO: 这儿目前是没有res的
            //self.res.status(timeout).send(result.msg);
            _callback(false, null)
        } else {
            var access_token = result.data.access_token;
            console.log('access_token', access_token);

            var voiceUrl = 'http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=' + input.access_token + '&media_id=' + input.media_id;
            console.log(voiceUrl);

            var data = {
                'format': 'amr',
                'rate': '8000',
                'channel': '1',
                'cuid': 'hahabit_just_for_test',
                'token': access_token,
                'lan': 'en',
                'url': voiceUrl
            };

            var url = 'http://vop.baidu.com/server_api';

            var request = require('request');

            var options = {
                headers: {"Connection": "close"},
                url: url,
                method: 'POST',
                json: true,
                body: data,
            };

            function callback(error, response, data) {
                if (!error && response.statusCode == 200) {
                    //console.log('----info------', data);
                    _callback(true, data);
                } else {
                    _callback(false, null);
                }
            }

            request(options, callback);
        }
    });
}

function getScore(standard, data) {
    segUtil = require('../util/segmentation_util');
    var dataSegResult = segUtil.segment(data.result);
    //console.log(dataSegResult);
    //console.log(dataSegResult.count);
    //console.log(dataSegResult.elementCount);
    //console.log(dataSegResult.samplingFrequency);

    var standardSegResult = segUtil.segment(standard);
    //console.log(statandSegResult);
    //console.log(statandSegResult.count);
    console.log(standardSegResult.elementCount);
    //console.log(statandSegResult.samplingFrequency);

    //console.log(dataSegResult.arr);
    var matchTimes = 0;
    var notMatchTimes = 0;

    for (var item in dataSegResult.arr) {
        //console.log(standardSegResult.arr[item]);
        if (standardSegResult.arr[item] != undefined) {
            matchTimes++;
        } else {
            notMatchTimes++;
        }

        //console(standardSegResult.arr['${item}']);
        //if (standardSegResult.arr[item] != undefined) {
        //  matchTimes++;
        //} else {
        //  notMatchTimes++;
        //}
    }
    console.log('matchTimes: ', matchTimes);
    console.log('notMatchTimes: ', notMatchTimes);

    var score = 0;
    if (((matchTimes + notMatchTimes) * 0.5 < matchTimes) && (standardSegResult.elementCount * 0.8 < matchTimes)) {
        console.log('matched');
        score = 60 + (matchTimes - standardSegResult.elementCount * 0.8) * 100 / (standardSegResult.elementCount * 0.2) * 0.4;
        if (score >= 100) {
            score = 100;
        }
        if (score >= 90) {
            score = scores[(Math.random() * 11 + 0.5).toFixed(0)];
        }
    } else {
        console.log('not matched');
    }
    console.log(score);

    return score.toFixed(0);
}

module.exports = new CustomService();
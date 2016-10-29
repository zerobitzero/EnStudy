/**
 * Created by zs on 16/10/26.
 */
var log4js = require('log4js');

log4js.configure({
    appenders: [
        {
            type: 'console',
            category: "console"

        }, //控制台输出
        {
            type: "file",
            filename: 'logs/log.log',
            pattern: "-yyyy-MM-dd",
            maxLogSize: 20480,
            backups: 3,
            category: 'dateFileLog'

        },//日期文件格式
        {
            type: "file",
            filename: 'logs/log.log',
            pattern: "-yyyy-MM-dd",
            maxLogSize: 20480,
            backups: 3,
        }//日期文件格式
    ],
    replaceConsole: true,   //替换console.log
    levels: {
        dateFileLog: 'debug',
        console: 'debug'
    }
});

var dateFileLog = log4js.getLogger('dateFileLog');
var consoleLog = log4js.getLogger('console');
exports.logger = dateFileLog;


exports.logger=function(name){
    var logger = log4js.getLogger(name);
    logger.setLevel('INFO');
    return logger;
}
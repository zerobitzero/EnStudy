/**
 * Created by zs on 16/10/25.
 */

var Util = {
    segment: segment
}

/**
 *
 * @param data eg: ["Yeah, I've only read it but it doesn't seem like it would be much fun to watch."];
 * @returns {{count: number, elementCount: number, samplingFrequency: *}}
 */
function segment(data) {
    console.log(typeof(data));

    var length = data.length;


    var objResult = {
        count: 0,
        elementCount: 0,
        samplingFrequency: length,
        arr: []
    };

    data.map(function (str) {
        var str = str.toLocaleLowerCase();
        var reg = /[,|\s|\.|\?]/;
        var res = str.split(reg);
        res
            .filter(function (str) {
                if (str.length == 0) {
                    return false;
                }
                return true;
            })
            .map(function (str) {
                if (Number(str) == str) {
                    // TODO:以后转换为对应的英文字符串发音来处理.
                    str = 'num_' + str;
                }
                if (objResult.arr[str] == undefined) {
                    objResult.arr[str] = 1;
                    objResult.elementCount++;
                } else {
                    objResult.arr[str] += 1;
                }
                console.log(objResult.arr);
                objResult.count++;
            });
    });
    console.log(objResult.arr);
    //console.log(objResult.elementCount);
    //console.log(objResult.samplingFrequency);

    return objResult;
}


module.exports = Util;
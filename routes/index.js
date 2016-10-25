var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Express'});

  //var result = {corpus_no: '6344582958537062625',err_msg: 'success.',err_no: 0, result:['yeah, IT must be something about IT, are the professor wouldn\'t have signed IT, i\'m sure i\'ll get out, ','yeah, IT must be something about IT, are the professor wouldn\'t have signed IT, and sure i\'ll get out, ', 'yeah, IT must be something about IT, are the professor wouldn\'t have signed IT, i\'m sure i\'ll be get out, ', 'yeah, IT must be something about IT, are the professor wouldn\'t have signed IT, and sure i\'ll be get out, ', 'yeah, IT must be something about IT, or the professor wouldn\'t have signed IT, i\'m sure i\'ll get out, ', 'yeah, IT must be something about IT, or the professor wouldn\'t have signed IT, and sure i\'ll get out, ', 'yeah, IT must be something about IT, or the professor wouldn\'t have signed IT, i\'m sure i\'ll be get out, ', 'yeah, IT must be something about IT, or the professor wouldn\'t have signed IT, and sure i\'ll be get out, ', 'yeah, IT must be something about IT, all the professor wouldn\'t have signed IT, i\'m sure i\'ll get out, ', 'yeah, IT must be something about IT, all the professor wouldn\'t have signed IT, and sure i\'ll get out, '],sn: '56018403481477213332' };
  var data = { corpus_no: '6344582958537062625',
    err_msg: 'success.',
    err_no: 0,
    result:
        [ 'yeah, IT must be something about IT, are the professor wouldn\'t have signed IT, i\'m sure i\'ll get out, ',
          'yeah, IT must be something about IT, are the professor wouldn\'t have signed IT, and sure i\'ll get out, ',
          'yeah, IT must be something about IT, are the professor wouldn\'t have signed IT, i\'m sure i\'ll be get out, ',
          'yeah, IT must be something about IT, are the professor wouldn\'t have signed IT, and sure i\'ll be get out, ',
          'yeah, IT must be something about IT, or the professor wouldn\'t have signed IT, i\'m sure i\'ll get out, ',
          'yeah, IT must be something about IT, or the professor wouldn\'t have signed IT, and sure i\'ll get out, ',
          'yeah, IT must be something about IT, or the professor wouldn\'t have signed IT, i\'m sure i\'ll be get out, ',
          'yeah, IT must be something about IT, or the professor wouldn\'t have signed IT, and sure i\'ll be get out, ',
          'yeah, IT must be something about IT, all the professor wouldn\'t have signed IT, i\'m sure i\'ll get out, ',
          'yeah, IT must be something about IT, all the professor wouldn\'t have signed IT, and sure i\'ll get out, ' ],
    sn: '56018403481477213332' };

  segUtil = require('../util/segmentation_util');
  var dataSegResult = segUtil.segment(data.result);
  //console.log(dataSegResult);
  //console.log(dataSegResult.count);
  //console.log(dataSegResult.elementCount);
  //console.log(dataSegResult.samplingFrequency);

  standard = [
      //"Yeah, I've only read it but it doesn't seem like it would be much fun to watch."
      "Yeah, it must be something about it, or the professor wouldn't have assigned it. I'm sure I'll figure it out."
  ];
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
  console.log('matchTimes: ',matchTimes);
  console.log('notMatchTimes: ',notMatchTimes);

  if (((matchTimes + notMatchTimes) * 0.6 < matchTimes) && (standardSegResult.elementCount * 0.8 < matchTimes)) {
    console.log('matched');
  } else {
    console.log('not matched');
  }

  //dataSegResult.arr.forEach(function(item) {
  //  console.log(item);
  //});
});

module.exports = router;

var minerFactory = require('./rule-miner.js'),
    fs = require('fs');

var data = require('./indexObj.json');

var args = {
    minSupport:.5,
    minConfidence:.5,
    data: data
};
var miner = minerFactory(args).process();
                

var minerFactory = require('./rule-miner.js'),
    fs = require('fs');

var args = {
    minSupport:.5,
    minConfidence:.5
};
var miner = minerFactory(args);
                

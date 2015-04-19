var minerFactory = require('./rule-miner.js'),
    fs = require('fs');

var data = require('./indexObj.json');

var args = {
    minSupport:.5,
    minConfidence:.5,
    data: data,
    collectionCount: 500
};
var miner = minerFactory(args).on('done', function(data) {

    if(data && data.length && data.length > 0) {

        console.log("Generating Association Rule Output");

        var line = "";

        for(var i =0; i < data.length; i++) {

            line = i + ': {' + data[i].x.join(',') + '} => {' + data[i].y.join(',') + '};';
            line += ' support: ' + data[i].support.toFixed(2) + ', confidence: ' + data[i].confidence.toFixed(2);

            console.log(line);

            line += '\n';

            fs.appendFileSync('./assoc-rules.txt', line);

            line = '';

        }

        console.log("Document Generated");
    }

}).process();
                

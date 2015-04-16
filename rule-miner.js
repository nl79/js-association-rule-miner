/**
 * Created by nazarlesiv on 4/13/15.
 */
"use strict";
var
    emitter = require('events').EventEmitter,
    util = require("util"),
    fs = require('fs');

function create (args) {


    function miner(args) {

        //set the min support ratio
        this.minSupport = args.minSupport || .5;

        //set the min confidence ratio
        this.minConfidence = args.minConfidence || .5;

        //set the word map data.
        this.data = args.data;

        //count of the words in the data collection
        this.count = args.collectionCount || 0;

        //array of data object keys for quick traversal
        this.keys = [];

        //support count
        this.supportCount = 0;

        //cleaned collection
        this.l1 = [];

        //second order list
        this.l2 = [];




        this.process = function() {

            //get the data object keys.
            this.keys = Object.keys(this.data);

            //calculate the support count
            this.supportCount = (this.minSupport * this.count);

            //generate the initial set.
            this.buildL1();

            //build the first set of pairs.
            this.buildL2();

            console.log(this.l2.length);


        }

        this.buildL1 = function() {

            //eliminate the terms that are below the threshold.
            for(var i = 0; i < this.keys.length; i++) {

                //check if the data object has the key.
                if(this.data.hasOwnProperty(this.keys[i])) {

                    //store the term record.
                    var term = this.data[this.keys[i]];

                    //get the term keys (in this case they represent document numbers/
                    var keys = Object.keys(term);

                    //get keys array and count the length.
                    if(keys.length >= this.supportCount) {

                        this.l1.push({term: this.keys[i],
                            docs: keys});
                    }

                }

            }
        }

        this.buildL2 = function() {

            //co-ocurence count for each pair.
            var support = 0;

            //check each term against each other term to determine if they co-occur
            //inside a document.
            for(var i = 0; i < this.l1.length; i++) {
                var termOne = this.l1[i];

                for(var j = i + 1; j < this.l1.length; j++) {
                    var termTwo = this.l1[j];

                    //reset the support count
                    support = 0;
                    
                    //loop over the docs array and compare each value to see
                    //if the two terms occur in the same document.
                    for (var k=0; k< termOne.docs.length; k++) {

                        if(termTwo.docs.indexOf(termOne.docs[k]) != -1) {

                            //increment the co-ocurence count
                            support ++;


                            console.log(support);

                            //if the support is greater then or equal to the required
                            //support count, store the pair.
                            if(support >= this.supportCount) {

                                //a match was found. Create a pair and store it
                                //in the second order list.
                                this.l2.push([termOne, termTwo]);

                                console.log(termOne.term + ' , ' + termTwo.term);

                                break;
                            }

                        }
                    }
                }
            }

        }


    }


    /*
     *inherit the event mitter in order to
     *provite for events.
     */
    util.inherits(miner, emitter);

    return new miner(args);

}

module.exports = create;
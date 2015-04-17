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

        //first order list.
        this.l1 = [];

        //second order list
        this.l2 = [];

        //third order list;
        this.l3 = [];


        this.process = function() {

            //get the data object keys.
            this.keys = Object.keys(this.data);

            //calculate the support count
            this.supportCount = (this.minSupport * this.count);

            //generate the initial set.
            this.buildL1();

            //build the first set of pairs.
            this.buildL2();

            fs.writeFileSync("./l2.json", JSON.stringify(this.l2, null, 4));

            //build the third order list.
            this.buildL3();

            fs.writeFileSync("./l3.json", JSON.stringify(this.l3, null, 4));



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
                            docs: keys,
                            support: keys.length});
                    }

                }

            }
        }

        this.buildL2 = function() {

            //co-ocurence count for each pair.
            var support = 0;
            var docs = [];

            //check each term against each other term to determine if they co-occur
            //inside a document.
            for(var i = 0; i < this.l1.length; i++) {
                var termOne = this.l1[i];

                for(var j = i + 1; j < this.l1.length; j++) {
                    var termTwo = this.l1[j];

                    //reset the support count
                    support = 0;
                    docs = [];



                    //loop over the docs array and compare each value to see
                    //if the two terms occur in the same document.
                    for (var k=0; k< termOne.docs.length; k++) {

                        if(termTwo.docs.indexOf(termOne.docs[k]) != -1) {

                            //increment the co-ocurence count
                            support ++;

                            //store the doc number.
                            docs.push(termOne.docs[k]);

                            //if the current position is the last position in the array.
                            //compare the support count. If greater then the accepted
                            //support value, store the term pair and the suppor value.
                            if(k == termOne.docs.length -1 && support >= this.supportCount) {

                                this.l2.push({pair: [termOne.term, termTwo.term],
                                    docs:docs,
                                    support: support});

                                break;
                            }
                        }
                    }
                }
            }

        }


        this.buildL3 = function() {

            //build triplets out of the l2 array by comparing the pairs.
            //if two pairs have a same term, remove the duplicate and create
            //a triplet.
            for(var i = 0; i<this.l2.length; i++) {

                //save the pair.
                var pairOne = this.l2[i];

                for(var j = i+1; j< this.l2.length; j++) {

                    //save the pair.
                    var pairTwo = this.l2[j];

                    //merge the pairs.
                    this.merge(pairOne, pairTwo);


                }
            }
        }

        this.merge = function(p1, p2) {

            var valid = false;

            //compare the terms to make sure only a pair of 3 can be generated.
            //at least 1 term has to be in both sets to be valid for a
            //third order merger.
            for(var i = 0; i < p2.pair.length; i++) {

                if(p1.pair.indexOf(p2.pair[i]) != -1) {
                    valid = true;
                }

            }

            //if a set of 3 terms cannot be generated, return with out further processing.
            if(!valid) { return; }


            //loop over the terms in each pair and extract the none matching one.
            for(var i = 0; i < p2.pair.length; i++) {


                //check if the first containes the same term
                //if not, compare the document ids to make sure
                //all three terms co-occur.
                if(p1.pair.indexOf(p2.pair[i]) == -1) {

                    //count the number of matching documents in all three terms.
                    var count = 0;
                    var docs = [];

                    //loop over the document id array and count the number of
                    //documents that contain the terms from the first pair and the
                    //term from the second pair.
                    for(var j = 0; j < p1.docs.length; j++) {


                        if(p2.docs.indexOf(p1.docs[j]) != -1) {
                            //increment the count
                            count ++;

                            //save the document id
                            docs.push(p1.docs[j]);


                            if(count >= this.supportCount) {
                                //if the count is greater then or equal to the
                                //minimum support count, merge the term into the pair.

                                //build a set object.
                                var terms = [p2.pair[i]].concat(p1.pair);

                                this.l3.push({terms: terms,
                                            docs: docs});

                                console.log(terms);

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
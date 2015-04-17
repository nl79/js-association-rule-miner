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

            this.buildRules();




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

                if(p1.pair.indexOf(p2.pair[i]) >= 0) {

                    //remove the element from the pair array.
                    p2.pair.splice(i,1);

                    valid = true;

                }

            }

            //validate that the length of the first pair is 2
            //and the second is 1.

            if(!(p1.pair.length == 2 && p2.pair.length == 1)) {

                return;

            }

            var count = 0;
            var docs = [];

            for(var i = 0; i < p1.docs.length; i++) {

                if(p2.docs.indexOf(p1.docs[i]) != -1) {
                    count++;
                    docs.push(p1.docs[i]);

                }
            }

            if(count >= this.supportCount) {

                var terms = [];

                terms = terms.concat(p1.pair);
                terms = terms.concat(p2.pair);

                this.l3.push({terms: terms,
                                docs: docs});

                console.log(terms);

            }

            return;
        }

        this.buildRules = function() {

            //calculate the support and confidence for all of the pairs.
            for(var i = 0; i<this.l3.length; i++){

                var terms = this.l3[i].terms;

                //calculate the support value.
                var support = this.l3[i].docs.length / this.count;
                var confidence = [];

                for(var j = 0; j< terms.length; j++) {


                    var x = [];
                    var y = [];
                    var temp = null;
                    var index = j;

                    //turn 1 assignments
                    //x will hold the value of the valied at J.
                    //y will hold the values at 2 position later. If the position is at the end
                    //of the array, it will over flow to the start.
                    x.push(terms[j]);

                    for(var k = 0; k < 2; k++) {

                        if((index + 1) < terms.length) {
                            index++;
                        } else {
                            index = 0;
                        }

                        y.push(terms[index]);
                    }

                    //calculate the confidence values.
                    //passing the x terms
                    confidence.push(this.getConfidence(support, x));

                    //passing the y terms. has the same affect as reversing association
                    //test from x -> y, then y -> x with the the new value of x being the previous
                    //value of y.
                    confidence.push(this.getConfidence(support, y));





                }

            }

        }

        this.getConfidence = function(support, x) {
            console.log('support:' + support + " | x:" + x);

            return 'test';
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
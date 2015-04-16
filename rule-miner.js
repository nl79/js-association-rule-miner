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
        this.count = 0;

        //array of data object keys for quick traversal
        this.keys = [];

        //output collection
        this.collection =


        this.process = function() {

            //get the data object keys.
            this.keys = Object.keys(this.data);
            //set the data object key count
            this.count = this.keys.length;

            //build the initial array based on association.
            for(var i = 0; i < this.keys.length; i++) {
                console.log(this.keys[i] + " ");
                console.log(this.data[this.keys[i]]);

            }


        }

        this.getSupport = function(args) {

        }

        this.getConfidence = function (args) {

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
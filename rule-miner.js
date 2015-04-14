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


    }

    /*
     *inherit the event mitter in order to
     *provite for events.
     */
    util.inherits(Indexer, emitter);

    return new miner(args);

}

module.exports = create;
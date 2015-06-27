var chai = require("chai");
var timers = require("../lib/timer.js");
var EventEmitter = require('events').EventEmitter;

var should = chai.should();
var expect = chai.expect;

describe("Timer", function() {

  it('timer is a function', function() {

    timers.timer.should.be.a('function');
  });

  it('timer accepts a number as input', function() {

    expect(timers.timer.bind(timers.timer, {})).to.throw('Timer was set with an invalid interval.');
    expect(timers.timer.bind(timers.timer, NaN)).to.throw('Timer cannot be set with a NaN interval.');
  });

  var testTimer = new timers.timer(0);

  it('timer can emit events', function() {

    testTimer.should.be.an.instanceof(EventEmitter);
  })


})
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

  var testtime = null;
  var testcount = null;

  it('timer tick event should return time and count', function(done) {

    testTimer = new timers.timer(0);
    testTimer.addListener('tick', function(tickEvent) {

      testtime = tickEvent.tickTime;
      testcount = tickEvent.tickCount;
    });

    setTimeout(function(){

      testtime.should.not.be.null;
      testcount.should.not.be.null;
      done();
    }, 1000);
  });


});

describe('Control', function() {

  it('control is a function', function() {

    timers.control.should.be.a('function');
  });

  var testControl;
  var testtime = null;

  it('control.start should emit a start event', function(done) {

    testControl = new timers.control(1000);
    testControl.addListener('start', function(startEvent) {

      testtime = startEvent.startTime;
    });

    testControl.start();

    setTimeout(function() {

      testtime.should.not.be.null;
      done();
    }, 1500);
  });

  it('control.stop should emit a stop event', function(done) {

    testtime = null;

    testControl = new timers.control(1000);
    testControl.addListener('stop', function(stopEvent) {

      testtime = stopEvent.stopTime;
    });

    testControl.start();
    testControl.stop();

    setTimeout(function() {

      testtime.should.not.be.null;
      done();
    }, 1000);

  });
})
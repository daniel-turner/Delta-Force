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

  var testcount = null;

  it('timer tick event should return count', function(done) {

    testTimer = new timers.timer(0);
    testTimer.addListener('tick', function(tickEvent) {

      testcount = tickEvent.tickCount;
    });

    testTimer.doTick();

    setTimeout(function(){

      testcount.should.not.be.null;
      testTimer = null;
      done();
    }, 100);
  });


});

describe('Control', function() {

  it('control is a function', function() {

    timers.control.should.be.a('function');
  });

  it('control accepts a number as input', function() {

    expect(timers.control.bind(timers.control, {})).to.throw('Control was set with an invalid interval.');
    expect(timers.control.bind(timers.control, NaN)).to.throw('Control cannot be set with a NaN interval.');
  });

  var testControl;
  var testtime = null;

  it('control.start should emit a start event', function(done) {

    testControl = new timers.control(50);
    testControl.addListener('start', function(startEvent) {

      testtime = startEvent.startTime;
      testControl.stop();
      testControl = null;
    });

    testControl.start();

    setTimeout(function() {

      testtime.should.not.be.null;
      done();
    }, 150);
  });

  it('control.stop should emit a stop event', function(done) {

    testtime = null;

    testControl = new timers.control(50);
    testControl.addListener('stop', function(stopEvent) {

      testtime = stopEvent.stopTime;
    });

    testControl.start();
    testControl.stop();

    setTimeout(function() {

      testtime.should.not.be.null;
      testControl = null;
      done();
    }, 150);

  });
});

describe('TimeLimit', function() {
  it('timelimit is a function', function() {

    timers.timelimit.should.be.a('function');
  });

  it('timelimit accepts numbers as input', function() {

    expect(timers.timelimit.bind(timers.timelimit, {},5)).to.throw('TimeLimit was set with an invalid maxTime.');
    expect(timers.timelimit.bind(timers.timelimit, NaN,5)).to.throw('TimeLimit cannot be set with a NaN maxTime.');
    expect(timers.timelimit.bind(timers.timelimit, 10, NaN)).to.throw('Control cannot be set with a NaN interval.');
  });

  var testTimeLimit;

  it('timelimit should emit a complete event after the designated number of ticks', function(done) {

    testtime = null;
    testTimeLimit = new timers.timelimit(2,50);
    testTimeLimit.addListener('complete', function(completeEvent) {

      testtime = completeEvent.totalTime;
    });

    testTimeLimit.start();

    setTimeout(function() {

      testtime.should.not.be.null;
      testtime.should.be.above(99);
      testtime.should.be.below(250);
      done();
    }, 250);
  });
});

describe('LagTimer', function() {

  it('lagtimer is a function', function() {

    timers.lagTimer.should.be.a('function');
  });

  it('lagtimer accepts numbers as input', function() {

    expect(timers.lagTimer.bind(timers.lagTimer, 5, 5, {})).to.throw('LagTimer was set with an invalid allowedDeviation.');
    expect(timers.lagTimer.bind(timers.lagTimer, 5, 5, NaN)).to.throw('LagTimer cannot be set with a NaN allowedDeviation.');
    expect(timers.lagTimer.bind(timers.lagTimer, 10, NaN)).to.throw('Control cannot be set with a NaN interval.');
  });

  it('lagtimer should emit a lag event', function(done) {

    testtime = null;
    testLagTimer = new timers.lagTimer(1,50,10);
    testLagTimer.addListener('lag', function(lagEvent) {

      testtime = lagEvent.lag;
    });

    testLagTimer.start();

    setTimeout(function() {

      testtime.should.not.be.null;
      testLagTimer.stop();
      testLagTimer = null;
      done();
    }, 150);
  });
});

describe('CompensateTimer', function() {

  it('compensateTimer is a function', function() {

    timers.compensateTimer.should.be.a('function');
  });

  var testCompensateTimer;
  var startTime;
  var stopTime;

  it('compensateTimer should alter timer intervals', function(done) {

    testCompensateTimer = new timers.compensateTimer(5,50,50);
    testCompensateTimer.addListener('start', function(startEvent) {

      startTime = startEvent.startTime;
    });
    testCompensateTimer.addListener('stop', function(stopEvent) {

      stopTime = stopEvent.stopTime;
    });

    testCompensateTimer.start();

    setTimeout(function(){

      var totalLag = (stopTime - startTime) - 250;

      Math.abs(totalLag).should.be.below(200);

      stopTime.should.not.be.null;
      testCompensateTimer = null;
      done();
    }, 400);
  });
});
var EventEmitter = require('events').EventEmitter;
var util = require('util');

//timer
function Timer(interval) {

  var DEFAULT_INTERVAL = 1000;

  if(interval === undefined) {

    interval = DEFAULT_INTERVAL;
  }

  if(typeof interval !== 'number') {

    throw new TypeError("Timer was set with an invalid interval.");
  }

  if(isNaN(interval)) {

    throw new Error("Timer cannot be set with a NaN interval.")
  }

  EventEmitter.call(this);
  var self = this;
  this.i = 0;
  this.on = true;
  this.interval = interval;
  // this.intervalID = setInterval(function () {
  //   self.emit('tick', {

  //     tickCount: self.i++,
  //     tickTime: Date.now()
  //   });
  // }, interval);

  this.doTick = function() {

    setTimeout(function() {

      self.emit('tick', {

        tickCount: self.i++,
        tickTime: Date.now()
      });
    }, this.interval);
  };
};

util.inherits(Timer, EventEmitter);

//control
function Control(interval) {

  if(typeof interval !== 'number') {

    throw new TypeError("Control was set with an invalid interval.");
  }

  if(isNaN(interval)) {

    throw new Error("Control cannot be set with a NaN interval.")
  }

  //this.timer;
  var currentTickTime;
  this.currentTickCount;
  this.startTime;
  this.stopTime;
  this.lag;
  EventEmitter.call(this);
  Timer.call(this, interval);
  var self = this;

  this.start = function() {

    self.startTime = Date.now();

    // self.timer = new Timer(interval);
    self.addListener('tick', function(event) {

      self.currentTickCount = event.tickCount;
      currentTickTime = event.tickTime;
      self.lag = Date.now() - (self.startTime + (event.tickCount * interval));

      // self.emit('tick',{

      //   tickCount: event.tickCount,
      //   tickTime: event.tickTime
      // });

      self.doTick();
    });

    self.emit('start', {

      startTime: self.startTime
    });


    self.doTick();
  };

  this.stop = function() {

    self.stopTime = Date.now();

    self.emit('stop', {

      stopTime: self.stopTime,
      tickCount: self.currentTickCount,
      lastTickTime: self.currentTickTime
    });

    //clearInterval(self.timer.intervalID);
    self.timer = null;
  };
};

util.inherits(Control,EventEmitter);
util.inherits(Control,Timer);

//time limit
function TimeLimit(maxTime, interval) {

  var DEFAULT_MAXTIME = 10;

  if(maxTime === undefined) {

    maxTime = DEFAULT_MAXTIME;
  }

  if(typeof maxTime !== 'number') {

    throw new TypeError("TimeLimit was set with an invalid maxTime.");
  }

  if(isNaN(maxTime)) {

    throw new Error("TimeLimit cannot be set with a NaN maxTime.")
  }

  EventEmitter.call(this);
  Control.call(this,interval);
  var self = this;

  this.addListener('tick', function(event) {

    if(event.tickCount >= maxTime) {

      self.stop();
      self.emit('complete', {

        totalTime: (self.stopTime - self.startTime)
      });
    }
  });

  this.start();
};

util.inherits(TimeLimit,EventEmitter);
util.inherits(TimeLimit,Control);

//lag
function LagTimer(maxTime, interval, allowedDeviation) {

  var DEFAULT_DEVIATION = 1000;

  if(allowedDeviation === undefined) {

    allowedDeviation = DEFAULT_DEVIATION;
  }

  if(typeof allowedDeviation !== 'number') {

    throw new TypeError("LagTimer was set with an invalid allowedDeviation.");
  }

  if(isNaN(allowedDeviation)) {

    throw new Error("LagTimer cannot be set with a NaN allowedDeviation.")
  }

  EventEmitter.call(this);
  TimeLimit.call(this,maxTime,interval);
  var self = this;

  this.addListener('tick', function(tickEvent) {

    if(Math.abs(self.lag) > allowedDeviation) {

      self.emit('lag', {

        lag: self.lag
      });
    }
  });
};

util.inherits(LagTimer,EventEmitter);
util.inherits(LagTimer,TimeLimit);

function CompensateTimer(maxTime, interval, allowedDeviation) {

  // EventEmitter.call(this);
  LagTimer.call(this,maxTime,interval,allowedDeviation);

  this.addListener('lag', function(event) {

    console.log("old interval: " + this.interval);
    console.log("lag: " + event.lag);

    this.interval = this.interval - event.lag;

    console.log("new interval: " + this.interval);
  });
};

util.inherits(CompensateTimer,EventEmitter);
util.inherits(CompensateTimer,LagTimer);

module.exports = {

  timer: Timer,
  control: Control,
  timelimit: TimeLimit,
  lagTimer: LagTimer,
  compensateTimer: CompensateTimer
};


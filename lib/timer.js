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
  this.currentInterval = interval;
  this.originalInterval = interval;

  this.doTick = function() {

    setTimeout(function() {

      self.emit('tick', {

        tickCount: self.i++,
        // tickTime: Date.now()
      });
    }, self.currentInterval);
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
  // var currentTickTime;
  this.currentTickCount;
  this.startTime;
  this.stopTime;
  // this.lag;
  EventEmitter.call(this);
  Timer.call(this, interval);
  var self = this;

  this.start = function() {

    self.startTime = Date.now();
    self.addListener('tick', function(event) {

      self.currentTickCount = event.tickCount;
      // currentTickTime = event.tickTime;
      // self.lag = Date.now() - (self.startTime + (event.tickCount * self.interval));

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
      tickCount: self.currentTickCount
    });

    self.removeAllListeners('tick');
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

    throw new Error("LagTimer cannot be set with a NaN allowedDeviation.");
  }

  EventEmitter.call(this);
  TimeLimit.call(this,maxTime,interval);
  var self = this;
  this.lag = 0;

  this.addListener('tick', function(tickEvent) {

    self.lag = Date.now() - (self.startTime + (tickEvent.tickCount * self.originalInterval));

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
  var self = this;

  this.addListener('lag', function(event) {

    console.log('originalInterval: ' + self.currentInterval);
    console.log('lag: ' + event.lag);

    self.currentInterval = self.originalInterval - event.lag;

    if(self.currentInterval < 0) {

      self.currentInterval = 0;
    }

    console.log('updatedInterval: ' + self.currentInterval);
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


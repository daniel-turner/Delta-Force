var EventEmitter = require('events').EventEmitter;
var util = require('util');

//timer
function Timer(interval) {

  if(typeof interval !== 'number') {

    throw new TypeError("Timer was set with an invalid interval.");
  }

  if(isNaN(interval)) {

    throw new Error("Timer cannot be set with a NaN interval.")
  }

  EventEmitter.call(this);
  var self = this;
  this.i = 0;
  this.intervalID = setInterval(function () {
    self.emit('tick', {

      tickCount: self.i++,
      tickTime: Date.now(),
    });
  }, interval);
}

util.inherits(Timer, EventEmitter);

//control
function Control(interval) {

  if(typeof interval !== 'number') {

    throw new TypeError("Control was set with an invalid interval.");
  }

  if(isNaN(interval)) {

    throw new Error("Control cannot be set with a NaN interval.")
  }

  this.timer;
  var currentTickTime;
  this.currentTickCount;
  this.startTime;
  this.stopTime;
  EventEmitter.call(this);
  var self = this;

  this.start = function() {

    self.timer = new Timer(interval);
    self.startTime = Date.now();
    self.timer.addListener('tick', function(event) {

      self.currentTickCount = event.tickCount;
      currentTickTime = event.tickTime;

      self.emit('tick',{

        tickCount: event.tickCount,
        tickTime: event.tickTime
      });
    })

    self.emit('start', {

      startTime: self.startTime
    });

  };

  this.stop = function() {

    self.stopTime = Date.now();

    self.emit('stop', {

      stopTime: self.stopTime,
      tickCount: self.currentTickCount,
      lastTickTime: self.currentTickTime
    });

    clearInterval(self.timer.intervalID);
    self.timer = null;
  };
};

util.inherits(Control,EventEmitter);

//time limit
function TimeLimit(maxTime, interval) {

  if(maxTime === undefined) {

    maxTime = 10;
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

module.exports = {

  timer: Timer,
  control: Control,
  timelimit: TimeLimit
};


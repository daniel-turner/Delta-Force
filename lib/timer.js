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
  var intervalID = setInterval(function () {
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

  var timer;
  var currentTickTime;
  var currentTickCount;
  EventEmitter.call(this);
  var self = this;

  this.start = function() {

    timer = new Timer(interval);
    timer.addListener('tick', function(event) {

      currentTickCount = event.tickCount;
      currentTickTime = event.tickTime;
    })

    self.emit('start', {

      startTime: Date.now()
    });

  };

  this.stop = function() {

    self.emit('stop', {

      stopTime: Date.now(),
      tickCount: currentTickCount,
      lastTickTime: currentTickTime
    });

    clearInterval(timer.intervalID);
    timer = null;
  };
};

util.inherits(Control,EventEmitter);

//time limit


module.exports = {

  timer: Timer,
  control: Control
};


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

      tickInterval: self.i++
    });
  }, interval);
}

util.inherits(Timer, EventEmitter);

//control
function Control() {

  var timer;
  EventEmitter.call(this);
  var self = this;

  var start = function() {

    timer = new Timer(1000);
    self.emit('start', {

      startTime: Date.now()
    });

  };

  var stop = function() {

    self.emit('stop', {

      endTime: Date.now()
    });

    timer = null;
  };
}

util.inherits(Timer,EventEmitter);


module.exports = {

  timer: Timer
};


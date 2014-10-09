//
// clock.js
// Tracks MIDI clock events
//

//
// Dependencies
//
var util    = require('util');
var events  = require('events');
var md      = require('./mdevent');

//
// Constants
//
var TICKS_PER_BEAT = 6;


function Clock (host) {
    events.EventEmitter.call(this);

    this.host = host;
    this.ticks = 0;
    this.playing = false;

    var self = this;
    this.host.on('event', function (event) {
        handleEvent(event, self);
    });
}

util.inherits(Clock, events.EventEmitter);

var handleEvent = function (e, clock) {
    if (e instanceof md.ClockEvent) {
        if (e.kind === 'clock') {
            if (clock.ticks === 0) clock.emit('beat');
            clock.ticks += 1;
            if (clock.ticks >= TICKS_PER_BEAT) {
                clock.ticks = 0;
                return;
            }
        }

        if (e.kind === 'start' || e.kind === 'continue') {
            clock.ticks = 0;
            return;
        }

        if (e.kind === 'stop') {
            clock.emit('stop');
            return;
        }
    } else if (e instanceof md.PositionEvent) {
        clock.emit('position', e.position);
        return;
    }
};

module.exports = Clock;
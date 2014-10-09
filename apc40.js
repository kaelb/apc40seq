//
// apc40.js
// Connects to and handles events 
// Connects to and handles MIDI events sent to & received from APC40
//

//
// Dependencies
//
var util    = require('util');
var events  = require('events');
var midi    = require('midi');
var md      = require('./mdevent');


function APC40 (port) {
    events.EventEmitter.call(this);

    this.output = new midi.output();
    this.output.openPort(port);

    this.input = new midi.input();
    this.input.openPort(port);

    var self = this;

    this.input.on('message', function (deltaTime, message) {
        var event = md.eventFromMessage(message);
        self.emit('event', event);
    });
}

util.inherits(APC40, events.EventEmitter);

APC40.prototype.sendEvent = function (event) {
    var message = event.message();
    this.output.sendMessage(message);
};

module.exports = APC40;
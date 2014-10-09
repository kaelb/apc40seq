//
// host.js
// Connects to and handles MIDI events sent to & received from host DAW
//

//
// Dependencies
//
var util    = require('util');
var events  = require('events');
var midi    = require('midi');
var md      = require('./mdevent');

//
// Constants
//
var DEVICE_NAME = 'APC Sequencer';


function Host () {
    events.EventEmitter.call(this);

    this.output = new midi.output();
    this.output.openVirtualPort(DEVICE_NAME);

    this.input = new midi.input();
    this.input.ignoreTypes(true, false, true);
    this.input.openVirtualPort(DEVICE_NAME);

    var self = this;

    this.input.on('message', function (deltaTime, message) {
        var event = md.eventFromMessage(message);
        self.emit('event', event);
    });
}

util.inherits(Host, events.EventEmitter);

Host.prototype.sendEvent = function (event) {
    var message = event.message();
    this.output.sendMessage(message);
};

Host.prototype.sendNote = function (channel, pitch, velocity, duration) {
    var noteOn = new md.NoteEvent(channel, pitch, 'on', velocity);
    var noteOff = new md.NoteEvent(channel, pitch, 'off', 0);

    this.sendEvent(noteOn);

    var self = this;
    setTimeout(function () {
        self.sendEvent(noteOff);
    }, duration);
}

module.exports = Host;

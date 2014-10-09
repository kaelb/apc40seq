//
// mdevent.js
// Wrapper classes that convert to & from raw MIDI packets
//

//
// Dependencies
//

var util    = require ('util');

//
// MIDI constants
//
var MSG_MASK    = parseInt('0xF0');
var NOTE_OFF    = parseInt('0x80');
var NOTE_ON     = parseInt('0x90');
var CTRL_CHANGE = parseInt('0xB0');

//
// MIDI realtime constants
// (do not require MSG_MASK)
//
var RT_CLOCK    = parseInt('0xF8');
var RT_START    = parseInt('0xFA');
var RT_CONTINUE = parseInt('0xFB');
var RT_STOP     = parseInt('0xFC');

//
// Song position pointer constants
//
var SONG_POSITION       = parseInt('0xF2');
var POSITION_DATA_MASK  = parseInt('0x7F');

function Event () {
}

function NoteEvent (channel, pitch, kind, velocity) {
    Event.call(this);
    this.channel = channel;
    this.pitch = pitch;
    this.kind = kind;
    if (!(kind === 'on' || kind === 'off')) this.kind = 'on';
    this.velocity = velocity;
}
util.inherits(NoteEvent, Event);

NoteEvent.prototype.message = function () {
    var msg = [];
    var msgtype;
    if (this.kind === 'on') {
        msgtype = NOTE_ON;
    } else {
        msgtype = NOTE_OFF;
    }

    msg.push((msgtype & MSG_MASK) + (this.channel - 1));
    msg.push(this.pitch);
    msg.push(this.velocity);
    return msg;
};

function CCEvent (channel, control, value) {
    Event.call(this);
    this.channel = channel;
    this.control = control;
    this.value = value;
}
util.inherits(CCEvent, Event);

CCEvent.prototype.message = function () {
    var msg = [];
    msg.push((CTRL_CHANGE & MSG_MASK) + (this.channel - 1));
    msg.push(this.control);
    msg.push(this.value);
    return msg;
};

function ClockEvent (kind) {
    Event.call(this);
    this.kind = kind;
}
util.inherits(ClockEvent, Event);

ClockEvent.prototype.message = function () {
    var msg = [];
    if (this.kind === 'clock') msg.push(RT_CLOCK);
    if (this.kind === 'start') msg.push(RT_START);
    if (this.kind === 'continue') msg.push(RT_CONTINUE);
    if (this.kind === 'stop') msg.push(RT_STOP);
    return msg;
};

function PositionEvent (position) {
    Event.call(this);
    this.position = position;
}
util.inherits(PositionEvent, Event);

PositionEvent.prototype.message = function () {
    var msg = []
    msg.push(SONG_POSITION);
    msg.push(this.position & POSITION_DATA_MASK);
    msg.push(this.position & (POSITION_DATA_MASK << 7));
    return msg;
};

function eventFromMessage (msg) {
    var event;
    // first check for clock messages
    if (msg[0] === RT_CLOCK) {
        event = new ClockEvent('clock');
        return event;
    }
    if (msg[0] === RT_START) {
        event = new ClockEvent('start');
        return event;
    }
    if (msg[0] === RT_CONTINUE) {
        event = new ClockEvent('continue');
        return event;
    }
    if (msg[0] === RT_STOP) {
        event = new ClockEvent('stop');
        return event;
    }
    // then song position message
    if (msg[0] === SONG_POSITION) {
        // combine two 7-bit data values of msg to get position
        var position = (msg[1] | (msg[2] << 7));
        event = new PositionEvent(position);
        return event;
    }
    // otherwise, it is a standard MIDI message
    var msgtype = msg[0] & MSG_MASK;
    var channel = (msg[0] - msgtype) + 1;
    if (msgtype === NOTE_ON || msgtype == NOTE_OFF) {
        var pitch = msg[1];
        var kind = (msgtype === NOTE_ON) ? 'on' : 'off';
        var velocity = msg[2];
        event = new NoteEvent(channel, pitch, kind, velocity);
        return event;
    } 
    if (msgtype === CTRL_CHANGE) {
        var control = msg[1];
        var value = msg[2];
        event = new CCEvent(channel, control, value);
        return event;
    }
    event = new Event();
    return event;
}

module.exports = {
    Event:      Event,
    NoteEvent:  NoteEvent,
    CCEvent:    CCEvent,
    ClockEvent: ClockEvent,
    PositionEvent:  PositionEvent,
    eventFromMessage:   eventFromMessage
};

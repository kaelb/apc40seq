//
// apc-controls.js
// Handles MIDI input from APC40
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
var MATRIX_MIN_PITCH   = 53;
var MATRIX_NUM_PITCH   = 5;
var MATRIX_MIN_CHANNEL = 1;
var MATRIX_NUM_CHANNEL = 8;

var ROW_SELECT_MIN_PITCH = 82;
var ROW_SELECT_NUM_PITCH = 5;
var ROW_SELECT_CHANNEL = 1;

var COL_SELECT_PITCH = 52;
var COL_SELECT_MIN_CHANNEL = 1;
var COL_SELECT_NUM_CHANNEL = 8;

var CORNER_PITCH = 81;
var CORNER_CHANNEL = 1;

var SCROLL_KNOB_ID = 47;


function APCControls (apc) {
    events.EventEmitter.call(this);

    this.apc = apc;

    var self = this;
    this.apc.on('event', function (event) {
        handleEvent(event, self);
    });
}

util.inherits(APCControls, events.EventEmitter);

var handleEvent = function (e, controls) {
    if (e instanceof md.NoteEvent) handleNoteEvent(e, controls);
    if (e instanceof md.CCEvent) handleCCEvent(e, controls);
};

var handleNoteEvent = function (e, controls) {
    if (e.pitch >= MATRIX_MIN_PITCH &&
        e.pitch < MATRIX_MIN_PITCH + MATRIX_NUM_PITCH &&
        e.channel >= MATRIX_MIN_CHANNEL &&
        e.channel < MATRIX_MIN_CHANNEL + MATRIX_NUM_CHANNEL)
    {
        var row = e.pitch - MATRIX_MIN_PITCH;
        var col = e.channel - MATRIX_MIN_CHANNEL;
        var eventName = 'matrix' + ((e.kind === 'on') ? 'Press' : 'Release');
        controls.emit(eventName, {row: row, col: col});
        return;
    }

    if (e.pitch >= ROW_SELECT_MIN_PITCH &&
        e.pitch < ROW_SELECT_MIN_PITCH + ROW_SELECT_NUM_PITCH &&
        e.channel === ROW_SELECT_CHANNEL)
    {
        var row = e.pitch - ROW_SELECT_MIN_PITCH;
        var eventName = 'rowSelect' + ((e.kind === 'on') ? 'Press' : 'Release');
        controls.emit(eventName, row);
        return;
    }

    if (e.pitch === COL_SELECT_PITCH &&
        e.channel >= COL_SELECT_MIN_CHANNEL &&
        e.channel < COL_SELECT_MIN_CHANNEL + COL_SELECT_NUM_CHANNEL)
    {
        var col = e.channel - COL_SELECT_MIN_CHANNEL;
        var eventName = 'colSelect' + ((e.kind === 'on') ? 'Press' : 'Release');
        controls.emit(eventName, col);
        return;
    }

    if (e.pitch === CORNER_PITCH &&
        e.channel === CORNER_CHANNEL)
    {
        var eventName = 'corner' + ((e.kind === 'on') ? 'Press' : 'Release');
        controls.emit(eventName);
        return;
    }
};

var handleCCEvent = function (e, controls) {
    if (e.control === SCROLL_KNOB_ID) {
        var delta;
        if (e.value < 64) {
            delta = e.value;
        } else {
            delta = e.value - 128;
        }
        controls.emit('scrollKnobChanged', delta);
        return;
    }
};

module.exports = APCControls;
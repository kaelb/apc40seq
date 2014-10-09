//
// apc-display.js
// Sends MIDI events to configure APC40 display
//

//
// Dependencies
//
var md      = require('./mdevent');

//
// Begin display constants
//
var FRAME_LENGTH = 8;

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

// utility function for expressing binary constants
function b (binaryString) {
    return parseInt(binaryString, 2);
}

var CHARS = {
    'A' : [
        b('11100000'),
        b('10100000'),
        b('11100000'),
        b('10100000'),
        b('10100000')
    ],

    'B' : [
        b('11000000'),
        b('10100000'),
        b('11000000'),
        b('10100000'),
        b('11000000')
    ],

    'C' : [
        b('01100000'),
        b('10000000'),
        b('10000000'),
        b('10000000'),
        b('01100000')
    ],

    'D' : [
        b('11000000'),
        b('10100000'),
        b('10100000'),
        b('10100000'),
        b('11000000')
    ],

    'E' : [
        b('11100000'),
        b('10000000'),
        b('11100000'),
        b('10000000'),
        b('11100000')
    ],

    'F' : [
        b('11100000'),
        b('10000000'),
        b('11100000'),
        b('10000000'),
        b('10000000')
    ],

    'G' : [
        b('01100000'),
        b('10000000'),
        b('10100000'),
        b('10100000'),
        b('01100000')
    ],

    '0' : [
        b('00000010'),
        b('00000101'),
        b('00000101'),
        b('00000101'),
        b('00000010')
    ],

    '1' : [
        b('00000010'),
        b('00000110'),
        b('00000010'),
        b('00000010'),
        b('00000111')
    ],

    '2' : [
        b('00000110'),
        b('00000001'),
        b('00000010'),
        b('00000100'),
        b('00000111')
    ],

    '3' : [
        b('00000111'),
        b('00000001'),
        b('00000011'),
        b('00000001'),
        b('00000111')
    ],

    '4' : [
        b('00000101'),
        b('00000101'),
        b('00000111'),
        b('00000001'),
        b('00000001')
    ],

    '5' : [
        b('00000111'),
        b('00000100'),
        b('00000111'),
        b('00000001'),
        b('00000110')
    ],

    '6' : [
        b('00000011'),
        b('00000100'),
        b('00000111'),
        b('00000101'),
        b('00000111')
    ],

    '7' : [
        b('00000111'),
        b('00000001'),
        b('00000010'),
        b('00000100'),
        b('00000100')
    ],

    '8' : [
        b('00000111'),
        b('00000101'),
        b('00000111'),
        b('00000101'),
        b('00000111')
    ],

    'NEG' : [
        b('00000000'),
        b('00000000'),
        b('00011000'),
        b('00000000'),
        b('00000000'),
    ],

    'SHARP' : [
        b('00001000'),
        b('00000000'),
        b('00000000'),
        b('00000000'),
        b('00000000'),
    ]
};

var VELOCITY = {
    'GREEN' : 1,
    'GREEN_BLINK' : 2,
    'RED' : 3,
    'RED_BLINK' : 4,
    'ORANGE' : 5,
    'ORANGE_BLINK' : 6
};

var NOTE = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
var SHARP = [false, true, false, true, false, false, true, false, true, false, true, false];
//
// End display constants
//


function compLayers (layers) {
    var comp = [0, 0, 0, 0, 0];
    for (var x = 0; x < layers.length; x++) {
        var layer = layers[x];
        for (var i = 0; i < comp.length; i++) {
            comp[i] = (comp[i] | layer[i]);
        }
    }
    return comp;
}

function toStringPad (num, radix, size) {
    var s = num.toString(radix);
    while (s.length < size) s = '0' + s;
    return s;
}

function boolArray (bArray) {
    var result = [];
    for (var i = 0; i < bArray.length; i++) {
        var rowString = toStringPad(bArray[i], 2, 8);
        var boolRow = [];
        for (var j = 0; j < rowString.length; j++) {
            boolRow.push(rowString[j] === '1');
        }
        result.push(boolRow);
    }
    return result;
}

function APCDisplay (apc) {
    this.apc = apc;
    this.pitch = 0;
    this.displayingPitch = false;
    this.sequence = null;
    this.step = 0;
    this.frame = 0;

    clear(this.apc);
}

APCDisplay.prototype.showPitch = function () {
    displayPitch(this.apc, this.pitch);
    this.displayingPitch = true;
};

APCDisplay.prototype.hidePitch = function () {
    displaySequence(this.apc, this.sequence, this.step, this.frame);
    this.displayingPitch = false;
};

APCDisplay.prototype.setPitch = function (pitch) {
    this.pitch = pitch;
    if (this.displayingPitch) displayPitch(this.apc, this.pitch);
};

APCDisplay.prototype.setSequence = function (sequence) {
    this.sequence = sequence;
    if (!this.displayingPitch) displaySequence(this.apc, this.sequence, this.step, this.frame);
};

APCDisplay.prototype.setStep = function (step) {
    this.step = step;
    if (!this.displayingPitch) displaySequence(this.apc, this.sequence, this.step, this.frame);
};

APCDisplay.prototype.setFrame = function (frame) {
    this.frame = frame;
    if (!this.displayingPitch) displaySequence(this.apc, this.sequence, this.step, this.frame);
};

var displayPitch = function (apc, pitch) {
    var octave = Math.floor(pitch / 12) - 2;
    var note = NOTE[pitch % 12];
    var sharp = SHARP[pitch % 12];

    var layers = [];
    if (octave < 0) layers.push(CHARS.NEG);
    layers.push(CHARS['' + Math.abs(octave)]);
    layers.push(CHARS[note]);
    if (sharp) layers.push(CHARS.SHARP);

    var comp = compLayers(layers);
    var disp = boolArray(comp);

    for (var i = 0; i < MATRIX_NUM_PITCH; i++) {
        for (var j = 0; j < MATRIX_NUM_CHANNEL; j++) {
            var channel = j + MATRIX_MIN_CHANNEL;
            var pitch = i + MATRIX_MIN_PITCH;
            var kind = (disp[i][j]) ? 'on' : 'off';
            var velocity;
            if (j <= 2) {
                velocity = VELOCITY.ORANGE;
            } else if (j >= 5) {
                velocity = VELOCITY.GREEN;
            } else {
                velocity = (i === 2) ? VELOCITY.RED : VELOCITY.ORANGE;
            }

            var ledEvent = new md.NoteEvent(channel, pitch, kind, velocity);
            apc.sendEvent(ledEvent);
        }
    }
};

var displaySequence = function (apc, sequence, step, frame) {
    for (var i = 0; i < MATRIX_NUM_PITCH; i++) {
        for (var j = 0; j < MATRIX_NUM_CHANNEL; j++) {
            var frameOffset = (frame * FRAME_LENGTH);
            var channel = j + MATRIX_MIN_CHANNEL;
            var pitch = i + MATRIX_MIN_PITCH;
            var kind = (j + frameOffset === step) ? 'on' : 'off';
            var velocity = VELOCITY.ORANGE;

            if (sequence !== null && j + frameOffset < sequence.length) {
                if (sequence[j + frameOffset][i] > 0) {
                    kind = 'on';
                    velocity = VELOCITY.GREEN;
                }
            }

            var ledEvent = new md.NoteEvent(channel, pitch, kind, velocity);
            apc.sendEvent(ledEvent);
        }
    }
    var numFrames = sequence.length / FRAME_LENGTH;
    for (var i = 0; i < COL_SELECT_NUM_CHANNEL; i++) {
        var channel = i + COL_SELECT_MIN_CHANNEL;
        var pitch = COL_SELECT_PITCH;
        var kind = (i < sequence.length / FRAME_LENGTH) ? 'on' : 'off';
        var velocity = VELOCITY.GREEN;

        // selected frame
        if (i === frame) {
            kind = 'on';
            velocity = VELOCITY.GREEN_BLINK;
        }

        var ledEvent = new md.NoteEvent(channel, pitch, kind, velocity);
        apc.sendEvent(ledEvent);
    }
};

var clear = function (apc) {
    for (var i = 0; i < MATRIX_NUM_PITCH; i++) {
        for (var j = 0; j < MATRIX_NUM_CHANNEL; j++) {
            var channel = j + MATRIX_MIN_CHANNEL;
            var pitch = i + MATRIX_MIN_PITCH;
            var ledEvent = new md.NoteEvent(channel, pitch, 'off', 0);
            apc.sendEvent(ledEvent);
        }
    }
};

module.exports = APCDisplay;

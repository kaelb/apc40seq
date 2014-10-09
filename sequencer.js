//
// sequencer.js
// Handle note sequence storage, display, and playback
//

//
// Constants
//
var NOTE_LENGTH = 150;
var FRAME_LENGTH = 8;


function Sequencer (host, clock, controls, display) {
    this.host = host;
    this.clock = clock;
    this.controls = controls;
    this.display = display;

    this.voices = [64, 63, 62, 61, 60];
    this.step = 0;
    this.sequence = [];
    addFrame(this);
    this.frame = 0;

    var self = this;

    this.clock.on('beat', function () {
        onBeat(self);
    });

    this.clock.on('position', function (pos) {
        setPosition(self, pos);
    });

    this.controls.on('matrixRelease', function (point) {
        togglePoint(self, point);
    });

    this.controls.on('colSelectRelease', function (col) {
        setFrame(self, col);
    });
}

var addFrame = function (seq) {
    for (var step = 0; step < FRAME_LENGTH; step++) {
        var velocities = [];
        for (var voice = 0; voice < seq.voices.length; voice++) {
            velocities.push(0);
        }
        seq.sequence.push(velocities);
    }
    seq.display.setSequence(seq.sequence);
}

var onBeat = function (seq) {
    seq.display.setStep(seq.step);
    var velocities = seq.sequence[seq.step];
    for (var i = 0; i < seq.voices.length; i++) {
        var vel = velocities[i];
        if (vel === 0) continue;

        seq.host.sendNote(i + 1, seq.voices[i], vel, NOTE_LENGTH);
    }
    seq.step++;
    if (seq.step >= seq.sequence.length) seq.step = 0;
};

var setPosition = function (seq, pos) {
     seq.step = pos % seq.sequence.length;
     seq.display.setStep(seq.step);
}

var togglePoint = function (seq, p) {
    var step = p.col + seq.frame * FRAME_LENGTH;
    while (step >= seq.sequence.length) {
        addFrame(seq);
    }
    var vel = seq.sequence[step][p.row];
    vel = (vel > 0) ? 0 : 100;
    seq.sequence[step][p.row] = vel;
    seq.display.setSequence(seq.sequence);
};

var setFrame = function (seq, frame) {
    seq.frame = frame;
    seq.display.setFrame(seq.frame);
};

module.exports = Sequencer;
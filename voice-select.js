//
// voice-select.js
// Handles voice pitch selection scrolling knob input
//

//
// Constants
//
var SCROLL_DISTANCE = 10;


function VoiceSelect (host, controls, sequencer, display) {
    this.host = host;
    this.controls = controls;
    this.seq = sequencer;
    this.display = display;

    this.pressedRow = -1;
    this.scrollDelta = 0;

    var self = this;

    this.controls.on('rowSelectPress', function (row) {
        if (self.pressedRow !== -1) return;
        self.display.setPitch(self.seq.voices[row]);
        self.display.showPitch();
        self.pressedRow = row;
        self.scrollDelta = 0;
    });

    this.controls.on('rowSelectRelease', function (row) {
        if (row !== self.pressedRow) return;
        self.seq.voices[row] = self.display.pitch;
        self.display.hidePitch();
        self.pressedRow = -1;
    });

    this.controls.on('scrollKnobChanged', function (delta) {
        if (self.pressedRow === -1) return;
        var pitch = self.display.pitch;
        self.scrollDelta += delta;
        if (self.scrollDelta >= SCROLL_DISTANCE) {
            self.scrollDelta -= SCROLL_DISTANCE;
            pitch += 1;
            if (pitch > 127) pitch = 127;
            self.host.sendNote(self.pressedRow + 1, pitch, 100, 150);
        } else if (self.scrollDelta <= -SCROLL_DISTANCE) {
            self.scrollDelta += SCROLL_DISTANCE;
            pitch -= 1;
            if (pitch < 0) pitch = 0;
            self.host.sendNote(self.pressedRow + 1, pitch, 100, 150);
        }
        self.display.setPitch(pitch);
    })
}

module.exports = VoiceSelect
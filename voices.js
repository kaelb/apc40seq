//
// voices.js
// Stores & persists voice pitch selections
//

//
// Dependencies
//
var fs      = require('fs');
var path    = require('path');

//
// Constants
//
var FILEPATH = path.join(__dirname, 'savedVoices.json');

function Voices () {
    this.voices = null;

    var voicesFile;
    try {
        voicesFile = fs.readFileSync(FILEPATH, {'encoding' : 'utf8'});
    } catch (e) {
        if (e.code !== 'ENOENT') throw e;
        // file does not yet exist, create with default values
        this.voices = [64, 63, 62, 61, 60];
        this.write();
        return;
    }

    this.voices = JSON.parse(voicesFile);
}

Voices.prototype.write = function () {
    var voicesStr = JSON.stringify(this.voices);
    fs.writeFileSync(FILEPATH, voicesStr, {'encoding' : 'utf8'});
};

Voices.prototype.voice = function (i) {
    return this.voices[i];
}

Voices.prototype.setVoice = function (i, pitch) {
    if (i < 0 || i >= this.voices.length) return;
    this.voices[i] = pitch;
    this.write();
};

Voices.prototype.length = function () {
    return this.voices.length;
};

module.exports = new Voices();
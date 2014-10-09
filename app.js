//
// app.js
//

//
// Dependencies
//
var midi        = require('midi');
var minimist    = require('minimist');

var md      = require('./mdevent');
var Host    = require('./host');
var Clock   = require('./clock');
var APC40   = require('./apc40');
var APCDisplay  = require('./apc-display');
var APCControls = require('./apc-controls');
var Sequencer   = require('./sequencer');
var VoiceSelect = require('./voice-select');

//
// Setup
//

// get APC40 port from arguments (default is 0)
var argv = minimist(process.argv.slice(2));
var port = ('p' in argv) ? argv.p : 0;

var apc = new APC40(port);
var display = new APCDisplay(apc);
var controls = new APCControls(apc);

var host = new Host();
var clock = new Clock(host);

var seq = new Sequencer(host, clock, controls, display);
var voiceSelect = new VoiceSelect(host, controls, seq, display);

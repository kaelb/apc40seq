//
// app.js
//

//
// Dependencies
//
var midi    = require('midi');

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
var apc = new APC40();
var display = new APCDisplay(apc);
var controls = new APCControls(apc);

var host = new Host();
var clock = new Clock(host);

var seq = new Sequencer(host, clock, controls, display);
var voiceSelect = new VoiceSelect(host, controls, seq, display);

# apc40seq

An APC40 pattern sequence that syncs to your DAW.

*Warning: This software is very experimental, future, next-level stuff. It hasn't been tested much.*

## Usage

`apc40seq` requires [Node.js](http://nodejs.org/). Download and install that first. An [Akai APC40](http://www.akaipro.com/product/apc40) is also required. If you don't have one this probably isn't the pattern sequencer for you.

From the `apc40seq` directory, type:

```
$ node app.js
```

By default, it connects to MIDI port `0`. This assumes the APC 40 is the only MIDI device connected to your computer. If you have multiple MIDI devices, you may need to specify the MIDI port number of the APC 40. You can do this using the `-p` option.

```
$ node app.js -p 1
```

When `apc40seq` is running you should see a new MIDI input called `APC Sequencer` in your DAW. Configure your DAW to:

* Ignore the MIDI input from the `Akai APC40`
* Accept MIDI input from `APC Sequencer`
* Transmit MIDI Clock data to `APC Sequencer`

When you press play in your DAW you should see the orange playhead on the APC40 start moving. Now you're ready to start pushing buttons!

*Button-pushing demonstration video coming soon!*

## Known Limitations

* After increasing the pattern length, it cannot be shortened again
* Notes have a fixed duration & velocity
* MIDI control change events from knobs and sliders on the APC 40 are not emitted by `APC Sequencer`

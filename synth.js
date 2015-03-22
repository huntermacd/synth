// create audio context so sounds can happen
// we need to include a webkit prefix option for now
// "window" is required specifically for Safari
var ctx = new (window.AudioContext || window.webkitAudioContext)();

var osc;
var lfo;
var filter;
var amp;

// create oscillators
osc = ctx.createOscillator();
osc2 = ctx.createOscillator();
lfo = ctx.createOscillator();

// initialize oscillator values
osc.frequency.value = 440;
osc2.frequency.value = 220;
osc2.type = 'sawtooth';

// initialize lfo values
lfo.type = 'sine';
lfo.frequency.value = 0;

// create filter
filter = ctx.createBiquadFilter();

// create filter connection options
lfoGain = ctx.createGain();
lfoGain.gain.value = 10;

// create amplifier
amp = ctx.createGain();

// initialize amp volume
amp.gain.value = 0;

// patch modules
lfo.connect(lfoGain);
lfoGain.connect(osc2.detune); // vibrato
// lfoGain.connect(filter.Q) // phaser
// lfoGain.connect(amp.gain); // tremolo

osc.connect(filter);
osc2.connect(filter);
filter.connect(amp);
amp.connect(ctx.destination);

// start oscillators
osc.start(0);
osc2.start(0);
lfo.start(0);

// -------- UI --------

// Oscillator Type
var oscTypes = ['sine', 'square', 'sawtooth', 'triangle'];
var oscIcon = ['0px', '50px', '95px', '140px']
var oscSetting = 0;
var oscType = document.getElementById('oscType');
oscType.addEventListener('click', function(){
    if (oscSetting === oscTypes.length - 1){
        oscSetting = 0;
    } else {
        oscSetting++;
    }
    osc.type = oscTypes[oscSetting];
    oscType.style.backgroundPosition = oscIcon[oscSetting];
}, false);

// Filter Cutoff
var filterCutoff = document.getElementById('filterCutoff')
filterCutoff.addEventListener('input', function(event){filter.frequency.value = event.target.value;}, false);

// LFO Frequency
var lfoFreq = document.getElementById('lfoFreq');
lfoFreq.addEventListener('input', function(event){lfo.frequency.value = event.target.value;}, false);

// Envelope
var attack = document.getElementById('attack');
var decay = document.getElementById('decay');
var sustain = document.getElementById('sustain');
var release = document.getElementById('release');

// Controller
var controller = document.getElementById('controller');
controller.addEventListener('mousedown', playSound, false);
controller.addEventListener('mousemove', updatePitch, false);
controller.addEventListener('mouseleave', stopSound, false);
controller.addEventListener('mouseup', stopSound, false);

var lastEvent;

window.addEventListener('keydown', function(event){
    if (lastEvent && lastEvent.keyCode == event.keyCode) {
        return;
    }
    lastEvent = event;
    if (event.keyCode === 32){
        playSound();
    }
}, false);

window.addEventListener('keyup', function(){
    lastEvent = null;
    stopSound();
}, false);

// Envelope Functions
function playSound(){
    var now = ctx.currentTime;
    amp.gain.cancelScheduledValues(now);
    // attack
    amp.gain.setValueAtTime(amp.gain.value, now); // prevents "popping"
    amp.gain.linearRampToValueAtTime(1, now + parseFloat(attack.value));
    // decay, sustain
    amp.gain.linearRampToValueAtTime(sustain.value, now + parseFloat(attack.value) + parseFloat(decay.value));
}

function updatePitch(event){
    osc.frequency.value = event.target.dataset.freq;
    osc2.frequency.value = event.target.dataset.freq / 2;
}

function stopSound(){
    var now = ctx.currentTime;
    amp.gain.cancelScheduledValues(now);
    // release
    amp.gain.setValueAtTime(amp.gain.value, now);
    amp.gain.linearRampToValueAtTime(0, now + parseFloat(release.value));
}
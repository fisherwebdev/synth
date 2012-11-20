var test = document.getElementById("test-output");
var adsrgain = document.getElementById("adsr-gain");
var filterfrequency = document.getElementById("filter-frequency");
var openkeys = document.getElementById("open-keys");
var releasedkeys = document.getElementById("released-keys");


var context = new webkitAudioContext();
// var oscillators = new OscillatorPool(context, document.querySelector(".oscillator"));
var oscillators = new OscillatorNoteManager(context, document.querySelector(".oscillator"));
var filter = new Filter(context, document.querySelector(".filter"), {type: 0});
var speaker = new Destination(context);

var patchList = [
  {
    origin: oscillators,
    destination: filter
  },
  {
    origin: oscillators,
    destination: filter,
    destinationIndex: 4 // modulator
  },
  {
    origin: filter,
    destination: speaker
  }
];
patchList.forEach(function (p) {
  new Patch(context, p);
});

var noteKeys = {
  // k is the keyCode received in the event object from a keydown or keyup event
  A3: {k: 65, cents: 0},
  Bf3: {k: 87, cents: 100},
  B3: {k: 83, cents: 200},
  C3: {k: 68, cents: 300},
  Df3: {k: 82, cents: 400},
  D3: {k: 70, cents: 500},
  Ef3: {k: 84, cents: 600},
  E3: {k: 71, cents: 700},
  F3: {k: 72, cents: 800},
  Gf3: {k: 85, cents: 900},
  G3: {k: 74, cents: 1000},
  Af3: {k: 73, cents: 1100},
  A4: {k: 75, cents: 1200},
  Bf4: {k: 79, cents: 1300},
  B4: {k: 76, cents: 1400},
  C4: {k: 186, cents: 1500}
};

var keyboard = new Keyboard(document.querySelector("#keyboard"), noteKeys);

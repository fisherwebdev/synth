/* ADSR
 *
 * This controls an AudioGainNode, and while it is primarily designed to be used with an Envelope, it can operate
 * independently.  Please see Envelope.
 *
 */
var ADSR = function (context, elem, opts) {

  ADSR.superclass.constructor.call(this, context, elem, opts);

  this.envelope = opts.envelope;
  this.node = (opts.envelope && opts.envelope.node) || opts.gainNode || context.createGainNode();
  this.adsrValues = opts.adsrValues || {
    attackTime:  0.1,
    attackGain:  1,
    decayTime:   0.1,
    sustainGain: 0.1,
    releaseTime: 1
  };
  this.rampTypes = opts.rampTypes || {
    attack:  "linear",
    decay:   "linear",
    release: "linear"
  };

  // TODO : figure out the real calculus here
  this.timeConstantFactors = opts.timeConstantFactors || {
    decay: 0.2,
    release: 0.2
  };

  this.openTimestamps = {};
  this.releaseTimeouts = {};
};


extend(ADSR, Module, {

  /**
   * Adds event listeners to each UI control element in the ui hash.  These listeners will update the public properties
   * that are associated with each control.
   *
   * @param {Object} ui The object literal (hash) that describes the UI elements.  see getUI().
   */
  addEventListeners: function (ui) {

    var that = this;

    for (param in ui) {
      ui[param].addEventListener("change", function (e) {

        var phase;



        for (id in that.releaseTimeouts) {
          that.clearReleaseTimeout(id);
        }
        that.node.gain.cancelScheduledValues(that.context.currentTime);

        that.adsrValues[hyphenToCamel(e.target.className)] = e.target.value;

      });
    }
  },

  clearReleaseTimeout: function (id) {
    clearTimeout(this.releaseTimeouts[id]);
    this.releaseTimeouts[id] = null;
  },


  open: function (id) {

    // if this note is already playing, we want to clear it out before we re-open it
    if (this.releaseTimeouts[id]) {
      this.clearReleaseTimeout(id);
    }
    this.node.gain.cancelScheduledValues(this.context.currentTime);

    this.openTimestamps[id] = this.context.currentTime;

    var attackTargetTime = this.context.currentTime + this.adsrValues.attackTime,
      decayTargetTime,
      decayTimeConstant;

    // attack: linear or exponential
    this.node.gain[this.rampTypes.attack + "RampToValueAtTime"](this.adsrValues.attackGain, attackTargetTime);

    // decay: time constant
    if (this.rampTypes.decay === "time-constant") {
      decayTimeContant = this.adsrValues.decayTime * this.timeConstantFactors.decay;
      this.node.gain.setTargetValueAtTime(this.adsrValues.sustainGain, attackTargetTime, decayTimeConstant);
    }

    // decay: linear or exponential
    else {
      decayTargetTime = attackTargetTime + this.adsrValues.decayTime;
      this.node.gain[this.rampTypes.decay + "RampToValueAtTime"](this.adsrValues.sustainGain, decayTargetTime);
    }

  },


  release: function (id) {

    var that = this,
      releaseTargetTime,
      releaseTimeContant;

    // release: time constant
    if (this.rampTypes.release === "time-constant") {
      releaseTimeContant = this.adsrValues.releaseTime * this.timeConstantFactors.release;
      this.node.gain.setTargetValueAtTime(0, this.context.currentTime, releaseTimeContant);
      // need to call triggerEnvClosedEvent() when gain is 0.
      // what am i supposed to do here without a callback?  setTimeout...?
    }

    // release: linear or exponential
    else {
      releaseTargetTime = this.context.currentTime + this.adsrValues.releaseTime;
      this.node.gain[this.rampTypes.release + "RampToValueAtTime"](0, releaseTargetTime);
      this.releaseTimeouts[id] = setTimeout(function () {

        that.triggerEnvClosedEvent(id);
        that.releaseTimeouts[id] = null; // remove saved reference to the release timeout

      }, this.adsrValues.releaseTime * 1000)
    }
  },


  triggerEnvClosedEvent: function (id) {

    this.openTimestamps[id] = null;

    var envEvent = document.createEvent("Event"),
        eventName = "envelope.closed";
        envEvent.initEvent(eventName, false, false);
        envEvent.keyId = id;

    if (this.envelope) {
      this.envelope.elem.dispatchEvent(envEvent);
    }
    else {
      this.elem.dispatchEvent(envEvent);
    }
  }


});

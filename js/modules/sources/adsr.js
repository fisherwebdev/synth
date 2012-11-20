/**
 * The ADSR controls an AudioGainNode, and while it is primarily designed to be used with an Envelope, it can operate
 * independently.  Please see Envelope.
 *
 * An ADSR is a traditional module in analog synthesis controlling the envelope of a sound.  ADSR is an acronym that
 * stands for the different phases of the envelope: Attack, Decay, Sustain, Release.  By altering the duration and gain
 * level of each of these phases, it is possible to shape a sound in a great variety of ways.
 *
 * @param context
 * @param elem
 * @param opts
 * @constructor
 */
var ADSR = function (context, elem, opts) {

  ADSR.superclass.constructor.call(this, context, elem, opts);

  this.envelope = opts.envelope;
  this.node = (opts.envelope && opts.envelope.node) || opts.gainNode || context.createGainNode();

  this.attackTime  = opts.attackTime  || 0.1;
  this.attackGain  = opts.attackGain  || 1;
  this.decayTime   = opts.decayTime   || 0.1;
  this.sustainGain = opts.sustainGain || 0.1;
  this.releaseTime = opts.releaseTime || 1;

  this.attackRamp  = opts.attackRamp  || "linear";
  this.decayRamp   = opts.decayRamp   || "linear";
  this.releaseRamp = opts.releaseRamp || "linear";

  // TODO : figure out the real calculus here
  this.timeConstantFactors = opts.timeConstantFactors || {
    decay: 0.2,
    release: 0.2
  };

  this.openTime = null;
  this.releaseTimeout = null;

  document.addEventListener("envelope.closed", this.handleEnvelopeClosed)

};

extend(ADSR, Module, {



  /**
   * Add event listeners to each UI control element in the ui hash.  These listeners will update the public properties
   * that are associated with each control.  Note that this overrides the method found in Module superclass.
   *
   * @param {Object} ui The object literal (hash) that describes the UI elements.  see getUI().
   */
  addUIEventListeners: function (ui) {

    var that = this;

    for (param in ui) {
      ui[param].addEventListener("change", function (e) {
        that[hyphenToCamel(e.target.className)] = parseFloat(e.target.value);
      });
    }

  },



  /**
   * handle the envelope.closed event
   */
  handleEnvelopeClosed: function (e) {
    this.openTime = null;
  },



  /**
   * Clear and null the specified timeout from the releaseTimeout collection.
   *
   * @param id
   */
  clearReleaseTimeout: function () {
    clearTimeout(this.releaseTimeout);
    this.releaseTimeout = null;
  },



  /**
   * Open the specified ADSR envelope and set values for the various gain changes in its ADSR curve.
   *
   * @param id
   */
  open: function (id) {

    // if this note is already playing, we want to clear it out before we re-open it
    if (this.releaseTimeout) {
      this.clearReleaseTimeout();
    }
    this.node.gain.cancelScheduledValues(0);

    this.openTime = this.context.currentTime;
    this.node.gain.setValueAtTime(this.node.gain.value, this.context.currentTime);

    var attackTargetTime = this.context.currentTime + this.attackTime,
      decayTargetTime,
      decayTimeConstant;

    // attack: linear or exponential
    this.node.gain[this.attackRamp + "RampToValueAtTime"](this.attackGain, attackTargetTime);

    // decay: time constant
    if (this.decayRamp === "time-constant") {
      decayTimeConstant = this.decayTime * this.timeConstantFactors.decay;
      this.node.gain.setTargetValueAtTime(this.sustainGain, attackTargetTime, decayTimeConstant);
    }

    // decay: linear or exponential
    else {
      decayTargetTime = attackTargetTime + this.decayTime;
      this.node.gain[this.decayRamp + "RampToValueAtTime"](this.sustainGain, decayTargetTime);
    }

  },



  /**
   * Cause the specified ADSR envelope to begin its release phase.
   *
   * @param id
   */
  release: function (id) {

    var that = this,
        decayComplete = this.openTime + this.decayTime,
        releaseTargetTime,
        releaseTimeConstant;

    // allow the decay to complete before the release curve starts.  thanks to Duran Rose.
    if (this.context.currentTime < decayComplete) {
      setTimeout(function (id) {
        that.release(id);
      }, (decayComplete - this.context.currentTime) * 1000);
      return;
    }

    //this.node.gain.cancelScheduledValues(this.context.currentTime);
    this.node.gain.setValueAtTime(this.node.gain.value, this.context.currentTime);

    // release: time constant
    if (this.releaseRamp === "time-constant") {
      releaseTimeConstant = this.releaseTime * this.timeConstantFactors.release;
      this.node.gain.setTargetValueAtTime(0, this.context.currentTime, releaseTimeConstant);
      // need to call triggerEnvClosedEvent() when gain is 0.
      // what am i supposed to do here without a callback?  setTimeout...?
    }

    // release: linear or exponential
    else {
      releaseTargetTime = this.context.currentTime + this.releaseTime;
      this.node.gain[this.releaseRamp + "RampToValueAtTime"](0, releaseTargetTime);

      this.releaseTimeout = setTimeout(function () {

        that.triggerEnvClosedEvent(id);
        that.releaseTimeout = null; // remove saved reference to the release timeout

      }, this.releaseTime * 1000);
    }

  },



  /**
   * Trigger a synthetic event that declares that the specified ADSR envelope has closed.
   *
   * @param id
   */
  triggerEnvClosedEvent: function (id) {

    var envEvent = document.createEvent("Event"),
        eventName = "envelope.closed";
        envEvent.initEvent(eventName, false, false);
        envEvent.keyId = id;

    this.envelope && this.envelope.elem.dispatchEvent(envEvent) || this.elem.dispatchEvent(envEvent);

  }



});

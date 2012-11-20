/* Filter
 *
 * some of this is taken from HTML5 Rocks:
 * http://www.html5rocks.com/en/tutorials/webaudio/intro#toc-filter
 * http://www.html5rocks.com/en/tutorials/webaudio/intro/js/filter-sample.js
 *
 */
var Filter = function (context, elem, opts) {

  var opts = opts || {},
      that = this,
      ui,
      node;

  this.context = context;
  this.elem = elem;
  this.QUAL_MUL = 30;
  this.frequency = opts.frequency || 1;
  this.Q = opts.Q || 0.5;

  node = this.node = context.createBiquadFilter();
  node.type = opts.type || 0;
  node.frequency.value = this.getFrequencyFromLinear(this.frequency);
  node.Q.value = this.Q;
  node.gain.value = opts.gain || 0;

  // parameter modulator
  this.modulator = context.createScriptProcessorNode ?
    context.createScriptProcessorNode(256, 1, 1) : // new syntax
    context.createJavaScriptNode(256, 1, 1);       // deprecated
  this.modulator.onaudioprocess = function (e) {
    that.modulate(e, that);
  };

  ui = this.getUI(elem);
  this.modInvert = "";
  this.modParam = (ui.modParam && ui.modParam.value) || "frequency";
  this.modWidth = (ui.modWidth && parseFloat(ui.modWidth.value)) || 0;
  this.modSens = (ui.modSens && parseFloat(ui.modSens.value)) || 1;
  this.modulator.connect(context.destination);
  this.modBypass = false;

  this.compressor = context.createDynamicsCompressor();
  this.node.connect(this.compressor);

  this.inputs = [this.node, this.node.frequency, this.node.Q, this.node.gain, this.modulator];
  this.outputs = [this.compressor, this.node.frequency, this.node.Q, this.node.gain, this.node, this.modulator];

  this.addUIEventListeners(ui);

};

Filter.prototype = {


  /**
   * This method returns the ui hash with camelCased keys based on hyphenated class names. For example, a class name
   * like "mod-param" becomes the key "modParam". The values of the hash are input or select elements.  Thus, the
   * returned hash represents all the user interface controls for the module.
   *
   * @param {HTMLElement} elem The element that contains the entire UI for the module.
   * @return {Object} The object literal (hash) that describes the UI elements.
   */
  getUI: function (elem) {
    var ui = {},
        childNodes = elem.childNodes,
        control,
        i = 0,
        len = childNodes.length;
    for (; i < len; i++) {
      child = childNodes[i];
      if (child.tagName === "INPUT" || child.tagName === "SELECT") {
        ui[hyphenToCamel(child.className)] = child;
      }
    }
    return ui;
  },


  /**
   * Adds event listeners to each UI control element in the ui hash.  These listeners will update the public properties
   * that are associated with each control.
   *
   * @param {Object} ui The object literal (hash) that describes the UI elements.  see getUI().
   */
  addUIEventListeners: function (ui) {
    var that = this;
    for (param in ui) {
      ui[param].addEventListener("change", function (e) {
        e.target.blur();
        that.setParam(hyphenToCamel(e.target.className), e.target.value, e);
      });
    }
  },


  /**
   * This method wraps and exposes the filter node's getFrequencyResponse method.
   *
   * @return {Float} frequency response
   */
  getFrequencyResponse: function (requencyHz, magResponse, phaseResponse) {
    return this.node.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
  },


  /**
   * Sets a parameter (that is, a public property) of the filter immediately, at the current time.
   * @param {String} parameter
   * @param {Number} value
   */
  setParam: function (parameter, value) {

    var basics = ["modSens", "modWidth", "modParam"],
        alphas = ["modParam", "modBypass", "modInvert"];

    if (alphas.indexOf(parameter) === -1) {
      value = parseFloat(value)
    }

    if (basics.indexOf(parameter) !== -1) {
      this[parameter] = value;
    }

    else {
      switch (parameter) {
        case "type":
          this.node.type = value;
          break;
        case "frequency":
          this.frequency = value;
          this.node.frequency.value = this.getFrequencyFromLinear(value);
          break;
        case "Q":
          this.Q = value;
          var q = value * this.QUAL_MUL;
          this.node.Q.value = this.Q = q;
          break;
        case "gain":
          this.node.gain.value = value;
          break;
        case "modInvert":
          this.modInvert = this.elem.querySelector(".mod-invert").checked;
          break;
        case "modBypass":
          this.modBypass = this.elem.querySelector(".mod-bypass").checked;
          break;
      }
    }

  },


  getFrequencyFromLinear: function (value, minFreq, maxFreq) {
    var minValue = minFreq || 40, // changing this value appears to change the input gain (adsrgain).  why?  this is a bug?
        maxValue = maxFreq || this.context.sampleRate / 2,
        numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2,
        multiplier = Math.pow(2, numberOfOctaves * (value - 1.0));
    return maxValue * multiplier
  },


  /**
   * Modulate a filter parameter.  This is an event handler, so we pass the context of the filter to it with the "that"
   * parameter
   * @param {Object} e An audioprocess event object.
   * @param {Object} that The filter object, providing the same context "this" usually provides.
   */
  modulate: function (e, that) {

    if (that.modBypass) { return; }

    var inputBuffer = e.inputBuffer.getChannelData(0),
        value = getAbsMax( inputBuffer) * that.modSens,
        param = that.modParam;

    if (that.modInvert === true) {
      value = Math.max(1, that.modSens) - value;
    }

    switch (param) {
      case "frequency":
        that.modulateFrequency.call(that, value);
        break;
      case "Q":
        that.modulateQ.call(that, value);
        break;
      case "frequency-and-Q":
        that.modulateQ.call(that, value);
        that.modulateFrequency.call(that, value);
        break;
    }

    // log out to screen
    filterfrequency.innerText = param;
    adsrgain.innerText = value


  },


  modulateFrequency: function (value) {

    var minValue = Math.max(0.01, this.frequency - this.modWidth),
        maxValue = Math.min(1, this.frequency + this.modWidth),
        minFreq  = this.getFrequencyFromLinear(minValue),
        maxFreq  = this.getFrequencyFromLinear(maxValue);

    this.node.frequency.value = this.getFrequencyFromLinear(value, minFreq, maxFreq);

    // log out to screen
    openkeys.innerText = minValue + " to " + maxValue;
    releasedkeys.innerText = minFreq + " to " + maxFreq;

  },

  modulateQ: function (value) {
    var minValue = Math.max(0, this.q - this.modWidth),
        maxValue = this.q - this.modWidth,
        delta = maxValue - minValue,
        q = value * delta * this.QUAL_MUL;
    this.node.Q.value = q;
  }

}
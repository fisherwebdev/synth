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
  this.type = opts.type || 0;
  this.frequency = opts.frequency || this.context.sampleRate / 2;
  this.Q = opts.Q || 0.5;
  this.QUAL_MUL = 30;
  this.gain = opts.gain || 1;

  node = this.node = context.createBiquadFilter();
  node.type = this.type;
  node.frequency.value = this.frequency;
  node.Q.value = this.Q;
  node.gain.value = this.gain;

  ui = this.getUI(elem);
  this.addEventListeners(ui);

  // parameter modulator
  this.modulator = context.createScriptProcessorNode ?
    context.createScriptProcessorNode(256, 1, 1) : // new style
    context.createJavaScriptNode(256, 1, 1);       // deprecated

  window.filternode = node
  window.modulator = this.modulator

  this.modulator.onaudioprocess = function (e) {
    that.modulate(e, that);
  };
  this.modInvert = "";
  this.modParam = (ui.modParam && ui.modParam.value) || "frequency";
  this.modWidth = (ui.modWidth && ui.modWidth.value) || 0;
  this.modSens = (ui.modSens && ui.modSens.value) || 1;
  this.modulator.connect(context.destination);
  this.modBypass = false;

  this.compressor = context.createDynamicsCompressor();
  this.node.connect(this.compressor);

  this.inputs = [this.node, this.node.frequency, this.node.Q, this.node.gain, this.modulator];
  this.outputs = [this.compressor, this.node.frequency, this.node.Q, this.node.gain, this.node, this.modulator];
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
  addEventListeners: function (ui) {
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

    var nonstandards = ["frequency", "Q", "modBypass", "modInvert"];
    if (nonstandards.indexOf(parameter) === -1) {
      console.log('set param', parameter, value, this.node)
      this[parameter] = value;
    }

    switch (parameter) {
      case "type":
        this.node.type = value;
        break;
      case "frequency":
        this.changeFrequency(value);
        break;
      case "Q":
        var q = value * this.QUAL_MUL;
        this.Q = q;
        this.node.Q.value = q;
        break;
      case "gain":
        this.node.gain.setValueAtTime(value, this.context.currentTime);
        break;
      case "modInvert":
        this.modInvert = this.elem.querySelector(".mod-invert").checked;
        break;
      case "modBypass":
        this.modBypass = this.elem.querySelector(".mod-bypass").checked;
        break;
    }

  },

  changeFrequency: function (value) {
    var minValue = 40, // changing this value appears to change the input gain (adsrgain).  why?  this is a bug.
        maxValue = this.context.sampleRate / 2,
        numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2,
        multiplier = Math.pow(2, numberOfOctaves * (value - 1.0));
    this.node.frequency.value = this.frequency = maxValue * multiplier;

    filterfrequency.innerText = this.node.frequency.value;
    adsrgain.innerText = value
    openkeys.innerText = minValue + " to " + maxValue;
    releasedkeys.innerText = numberOfOctaves + " octaves";
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
      value = 1 - value;
    }

    if (param === "frequency-and-Q") {
      that.setParam.call(that, "Q", value);
      that.setParam.call(that, "frequency", value);
    }
    else {
      that.setParam.call(that, param, value);
    }
  }
}
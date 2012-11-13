/**
 * trying to abstract this from filter...
 * @param context
 * @param elem
 * @param opts
 * @constructor
 */
var Modulator = function (context, elem, opts) {

  var that = this;

  this.node = context.createScriptProcessorNode ?
    context.createScriptProcessorNode(256, 1, 1) : // new style
    context.createJavaScriptNode(256, 1, 1);       // deprecated

  // this.node.targetModule = opts.targetModule; // unnecessary?

  this.node.onaudioprocess = function (e) {
    that.modulate(e, filter);
  };

//  this.modParam = (ui.modParam && ui.modParam.value) || "frequency";
//  this.modWidth = (ui.modWidth && ui.modWidth.value) || 0;
//  this.modSens = (ui.modSens && ui.modSens.value) || 1;

  this.node.connect(context.destination);


};
Modulator.prototype = {


  /**
   * Modulate a parameter.
   * @param {Object} e An audioprocess event object.
   * @param {Object} that The filter object, providing the same context "this" usually provides.
   */
  modulate: function (e, that) {

    var inputBuffer = e.inputBuffer.getChannelData(0);
    var param = that.modParam

    // console.log(param);

    switch (param) {
      case "frequency":
        var max = getAbsMax( inputBuffer );
        adsrgain.innerText = max;

        var minValue = 400, // changing this value appears to change the input gain (adsrgain).  why?  this is a bug.
          maxValue = this.context.sampleRate / 2,
          numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2,
          multiplier = Math.pow(2, numberOfOctaves * (max - 1.0));
        this.node.frequency.value = maxValue * multiplier;

        openkeys.innerText = maxValue;
        releasedkeys.innerText = numberOfOctaves;
        filterfrequency.innerText = this.node.frequency.value;
        break;
      case "Q":
        break;
      case "gain":
        break;
    }
  }


};
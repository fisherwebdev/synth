/* OscillatorPool
 *
 */
var OscillatorPool = function (context, elem, opts) {

  var opts = opts || {};

  this.type = opts.type || 0;
  this.oscillators = []; // keep a list of all the oscillators regardless of whether they are active or in the pool

  OscillatorPool.superclass.constructor.call(this, context, elem, opts);

  this.addTypeSelectListener(elem);
};


extend(OscillatorPool, SourcePool, {


  createSourceNode: function () {
    var osc = this.context.createOscillator();
    osc.type = this.type;
    this.oscillators.push(osc);
    return osc;
  },


  playSourceNode: function (osc, e) {
    osc.noteOn(this.context.currentTime);
    osc.detune.setValueAtTime(e.cents, this.context.currentTime);
  },


  addTypeSelectListener: function (elem) {
    var that = this;
    elem.querySelector(".oscillator .type").addEventListener("change", function (e) {
      var target = e.target;
      that.changeType(target.value);
      target.blur();
    });

  },


  changeType: function (type) {
    this.oscillators.forEach(function (osc) {
      osc.type = type;
    });
  }


});
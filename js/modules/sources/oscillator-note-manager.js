/**
 *
 * @param context
 * @param elem
 * @param opts
 * @constructor
 */
var OscillatorNoteManager = function (context, elem, opts) {

  var opts = opts || {};

  this.type  = opts.type  || 0;

  OscillatorNoteManager.superclass.constructor.call(this, context, elem, opts);

  this.addTypeSelectListener(elem);

};

extend(OscillatorNoteManager, NoteManager, {


  /**
   *
   * @param id
   * @return {OscillatorNote}
   */
  createSource: function (e, id) {
    var opts = {
          cents: e.cents,
          type: this.type
        },
        src = new OscillatorNote(this.context, id, this.elem, opts);
    this.sources[id] = src;
    return src;
  },


  /**
   *
   * @param elem
   */
  addTypeSelectListener: function (elem) {
    var that = this;
    elem.querySelector(".oscillator .type").addEventListener("change", function (e) {
      var target = e.target;
      that.changeType(target.value);
      target.blur();
    });

  },


  /**
   *
   * @param type
   */
  changeType: function (type) {
    this.oscillators.forEach(function (osc) {
      osc.type = type;
    });
  }


});
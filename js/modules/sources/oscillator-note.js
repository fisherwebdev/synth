/**
 *
 * @param context
 * @param opts
 * @constructor
 */
var OscillatorNote = function (context, id, envElem, opts) {

  this.cents = opts.cents || 0;
  this.type  = opts.type  || 0;

  OscillatorNote.superclass.constructor.call(this, context, id, envElem, opts);

};

extend(OscillatorNote, Note, {


  /**
   *
   * @param opts
   */
  createNode: function (opts) {
    var node = this.context.createOscillator();
    node.detune.value = this.cents;
    node.type = this.type;
    return node;
  }


});
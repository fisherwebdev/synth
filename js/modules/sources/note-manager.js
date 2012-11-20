/**
 *
 * @param context
 * @param elem The HTMLElement containing the entire UIEvent for making adjustments to the source.
 * @param opts
 * @constructor
 */
var NoteManager = function (context, elem, opts) {

  var opts = this.opts = opts || {};
  this.context = context;
  this.elem = elem;

  this.outputs = [context.createDynamicsCompressor()];
  this.keyCodes = {};
  this.sources = {};

  this.addKeyEventListeners();
};

NoteManager.prototype = {


  /**
   *
   */
  addKeyEventListeners: function () {
    var that = this;
    document.addEventListener("synth.keydown", function (e) {
      that.onKeyDown(e, that);
    });
    document.addEventListener("synth.keyup", function (e) {
      that.onKeyUp(e, that);
    });
    this.elem.addEventListener("envelope.closed", function (e) {
      that.destroySource(e.keyId);
    });
  },


  /**
   *
   * @param e
   * @param that
   */
  onKeyDown: function (e, that) {

    var id = e.keyId,
        src;

    // keydown keeps firing when held down, so we have to manage it.
    if (that.keyCodes[id]) { return; }
    that.keyCodes[id] = true;

    src = that.sources[id];

    if (!src) {
      src = that.createSource(e, id);
      src.connect(this.outputs[0]);
      src.start();
    }

    else {
      src.open();
    }
  },


  /**
   *
   * @param e
   * @param that
   */
  onKeyUp: function (e, that) {
    var id = e.keyId;
    if (that.keyCodes[id]) { that.keyCodes[id] = false; }
    var src = that.sources[id];
    src && src.release();
  },


  /**
   *
   * @param id
   */
  destroySource: function (id) {
    var src = this.sources[id];
    if (src) {
      src.disconnect(this.outputs[0]);
      this.sources[id] = null;
    }
  },


  /**
   *
   * @param e
   * @param id
   * @return {OscillatorNote}
   */
  createSource: function (e, id) { // override in subclass, like BufferNoteManager
    var src = new OscillatorNote(this.context, id, this.elem, {cents: e.cents});
    this.sources[id] = src;
    return src;
  }


};
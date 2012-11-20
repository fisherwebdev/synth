/**
 *
 * @param context
 * @param id
 * @param envElem
 * @param opts
 * @constructor
 */
var Note = function (context, id, envElem, opts) {

  var opts = this.opts = opts || {};

  this.context = context;
  this.id = id;
  this.envElem = envElem;

  this.envOptions = opts.envOptions || {
    type: "square"
  };

  this.node = this.createNode(opts.sourceOpts || {});
  this.env = new Envelope(context, envElem, opts.envOptions || {type: "square"});


};

Note.prototype = {


  /**
   *
   * @param opts
   * @return {*}
   */
  createNode: function (opts) { // override in subclass, like BufferNote
    var node = this.context.createOscillator();
    node.detune.value = this.opts.cents || 0;
    node.type = this.opts.type || 0;
    return node;
  },


  /**
   *
   */
  start: function () {
    this.node.noteOn(this.context.currentTime);
    this.open();
  },


  /**
   *
   */
  open: function () {
    this.env.open(this.id);
  },


  /**
   *
   */
  release: function () {
    this.env.release(this.id);
  },


  /**
   *
   */
  stop: function () {
    this.node.noteOff(0);
  },

  /**
   *
   * @param destination
   */
  connect: function (destination) {
    this.node.connect(this.env.node);
    this.env.connect(destination);
  },


  /**
   *
   * @param destination
   */
  disconnect: function (destination) {
    this.env.disconnect(destination);
    this.node.disconnect(this.env);
  }

};
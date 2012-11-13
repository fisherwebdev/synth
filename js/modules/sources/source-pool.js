/* SourcePool
 *
 */
var SourcePool = function (context, elem, opts) {

  var opts = opts || {};

  this.context = context;
  this.elem = elem;
  this.envOptions = opts.envSettings || {
    type: "square"
  };
  this.maxSources = opts.maxSources || 6;
  this.outputs = [context.createDynamicsCompressor()];
  this.keyCodes = {};
  this.sources = [];

  this.addKeyEventListeners();

  SourcePool.superclass.constructor.call(this);
};


extend(SourcePool, Pool, {


  createPool: function () {
    var pool = [],
      i = 0,
      source;
    for (; i < this.maxSources; i++) {
      source = {
        node: this.createSourceNode(),
        env: new Envelope(this.context, this.elem, this.envOptions)
      }
      this.sources.push(source);                  // ref to all sources regardless of state
      this.outputs.push(source.env.node);         // ref to individual envelope output
      pool.push(source);                          // create pool
      source.node.connect(source.env.node);       // connect source to envelope
      source.env.node.connect(this.outputs[0]);   // connect envelope to global compressor
    }
    return pool;
  },


  addKeyEventListeners: function () {
    var that = this;
    document.addEventListener("synth.keydown", function (e) {
      that.onKeyDown(e, that);
    });
    document.addEventListener("synth.keyup", function (e) {
      that.onKeyUp(e, that);
    });
    this.elem.addEventListener("envelope.closed", function (e) {
      that.checkin(e.keyId);
    });
  },


  onKeyDown: function (e, that) {
    var id = e.keyId,
      src;

    // keydown keeps firing when held down, so we have to manage it.
    if (that.keyCodes[id]) { return; }
    that.keyCodes[id] = true;

    // if note is not already playing, try to checkout a source from the pool
    if (that.isAvailable(id)) {
      src = that.checkout(id);
      if (src) {
        that.playSourceNode(src.node, e);
        src.env.open(id);
      }
    }
    else { // reopen the envelope for a note already playing
      that.getActiveSourceById(id).env.open(id);
    }
  },


  onKeyUp: function (e, that) {
    var id = e.keyId;
    if (that.keyCodes[id]) { that.keyCodes[id] = false; }
    var src = that.getActiveSourceById(id);
    src && src.env.release(id);
  },


  getActiveSourceById: function (id) {
    var source = this.active.filter(function (item) {
      return (item.id == id);
    })[0];
    if (source) {
      return source.item;
    }
  },


  playSourceNode: function (node, e) {} // for subclass-specific adjustments, like pitch or noteOn


});
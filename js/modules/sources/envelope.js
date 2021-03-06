/* Envelope
 *
 * this gain module is tightly coupled with each AudioSourceNode in the SourcePool
 *
 * the elem is required to be the same UI container element as the SourcePool,
 * as this is critical to the event-driven architecture.
 *
 */
var Envelope = function (context, elem, opts) {

  var opts = opts || {};

  this.context = context;
  this.elem = elem;
  this.node = context.createGainNode();
  this.node.gain.value = 0;
  this.adsr = opts.adsr || new ADSR(context, elem.parentNode.querySelector(".adsr"), {envelope: this});
  this.lfo = opts.lfo || new LFO(context, elem.parentNode.querySelector(".lfo"));

  //this.type = "adsr";

  //this.addEventListeners(elem);
};

Envelope.prototype = {

  /**
   *
   * @param id
   */
  triggerEnvClosedEvent: function (id) {
    var envEvent = document.createEvent("Event"),
      eventName = "envelope.closed";
    envEvent.initEvent(eventName, false, false);
    envEvent.keyId = id;
    this.elem.dispatchEvent(envEvent); // SourceNodes are listening to this
  },


  /**
   *
   * @param id
   */
  open: function (id) {
    this.adsr.open(id);
  },


  /**
   *
   * @param id
   */
  release: function (id) {
    this.adsr.release(id);
  },


  /**
   *
   * @param destination
   */
  connect: function (destination) {
    this.node.connect(destination);
  },


  /**
   *
   * @param destination
   */
  disconnect: function (destination) {
    this.node.disconnect(destination);
  }

};
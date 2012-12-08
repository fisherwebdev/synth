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
  open: this.adsr.open,


  /**
   *
   * @param id
   */
  release: this.adsr.release,


  /**
   *
   * @param destination
   */
  connect: this.node.connect,


  /**
   *
   * @param destination
   */
  disconnect: this.node.disconnect

};
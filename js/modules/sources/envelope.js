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


  open: function (id) {
    if (this.type === "adsr") {
      this.adsr.open(id);
    }
    else { // square
      this.node.gain.value = 1;
    }
  },


  release: function (id) {
    if (this.type === "adsr") {
      this.adsr.release(id);
    }
    else { // square
      this.node.gain.value = 0;
      this.triggerEnvClosedEvent(id);
    }
  },


//  addEventListeners: function (elem) {
//    var that = this;
//    elem.querySelector(".envelope").addEventListener("change", function (e) {
//
//      console.log('test');
//
//      that.type = e.target.value;
//      e.target.blur();
//    });
//    elem.querySelector(".envelope-lfo").addEventListener("change", function (e) {
//      // TODO ... not sure how to do this.
//      // console.log(e.target.value);
//    });
//  },
//
//  removeEventListeners: function () {
//    elem.querySelector(".envelope").removeEventListener("change");
//  },


  triggerEnvClosedEvent: function (id) {
    var envEvent = document.createEvent("Event"),
      eventName = "envelope.closed";
    envEvent.initEvent(eventName, false, false);
    envEvent.keyId = id;
    this.elem.dispatchEvent(envEvent); // SourceNodes are listening to this
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
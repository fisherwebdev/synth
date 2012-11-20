/* Patch
 *
 * The edge of the graph.
 *
 * The options may have the following attributes:
 *   origin: a Module or Source (required)
 *   originIndex: the output index of the origin (defaults to zero)
 *   destination: a Module or Destination (required)
 *   destinationIndex: the input index of the destination (defaults to zero)
 *
 * Otherwise, connections can be made with calls to setTerminal prior to createConnection.
 *
 */
var Patch = function (context, opts) {
  this.context = context;
  this.terminals = 0;
  if (this.setBothTerminals(opts)) {
    this.createConnection();
  }
};
Patch.prototype = {

  /**
   *
   * @param {String} type Either "origin" or "destination".
   * @param {Object} terminal The actual AudioNode or AudioParam to be connected as a terminal of the patch.
   * @param {Integer} terminalIndex The indexed position of the terminal within the inputs or outputs of its module wrapper.
   */
  setTerminal: function(type, terminal, terminalIndex) {
    this[type] = terminal;
    this[type + "Index"] = typeof terminalIndex === "number" ? terminalIndex : 0;
  },


  setBothTerminals: function (opts) {
    var opts = opts || {};

    ["origin", "destination"].forEach(function (type) {

      if (opts[type]) {
        this.setTerminal(type, opts[type], opts[type + "Index"]);
        this.terminals++;
      }

    }, this);

    return (this.terminals === 2);
  },


  createConnection: function (opts) {

    var start = this.origin.outputs[this.originIndex];
    var end = this.destination.inputs[this.destinationIndex];

    console.log(this, start, end);

    start.connect(end); // Web Audio API
  }
};
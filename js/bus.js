/**
 *
 * @param context
 * @constructor
 */
var Bus = function (context) {
  var input = context.createGainNode()
  var output = context.createDynamicsCompressor();
  input.connect(output);

  this.context = context;
  this.inputs = [input];
  this.outputs = [output, input];
};
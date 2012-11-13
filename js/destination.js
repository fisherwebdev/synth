/* Destination
 *
 * This wrapper simply exposes a destination in the same manner as other Modules,
 * so a Patch may connect to it.  Future implementations might take into account stereo, surround, etc.
 *
 */
var Destination = function (context) {
  this.context = context;
  this.inputs = [context.destination];
};
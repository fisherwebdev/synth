/**
 * parent class of modules.  should this be an interface instead?
 *
 * @param context
 * @param elem
 * @param opts
 * @constructor
 */
var Module = function (context, elem, opts) {

  var opts = opts || {}

  this.context = context;
  this.elem = elem;

  this.addUIEventListeners(this.getUI(elem));

};
Module.prototype = {


  /**
   * This method returns the ui hash with camelCased keys based on hyphenated class names. For example, a class name
   * like "mod-param" becomes the key "modParam". The values of the hash are input or select elements.  Thus, the
   * returned hash represents all the user interface controls for the module.
   *
   * @param {HTMLElement} elem The element that contains the entire UI for the module.
   * @return {Object} The object literal (hash) that describes the UI elements.
   */
  getUI: function (elem) {

    var ui = {},
      childNodes = elem.childNodes,
      control,
      i = 0,
      len = childNodes.length;

    for (; i < len; i++) {
      child = childNodes[i];
      if (child.tagName === "INPUT" || child.tagName === "SELECT") {
        ui[hyphenToCamel(child.className)] = child;
      }
    }

    return ui;
  },


  /**
   * Add event listeners to each UI control element in the ui hash.  These listeners will update the public properties
   * that are associated with each control.
   *
   * @param {Object} ui The object literal (hash) that describes the UI elements.  see getUI().
   */
  addUIEventListeners: function (ui) {

    var that = this;

    for (param in ui) {
      ui[param].addEventListener("change", function (e) {

        e.target.blur();
        that[hyphenToCamel(e.target.className)] = e.target.value;

      });
    }
  }


};
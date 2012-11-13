/* Keyboard
 *
 * noteKeys is a hash of objects in the form of:
 * {k: [qwerty key number] cents: [cent offset from 440Hz]}.
 * the key for each object in the hash corresponds to an element id within the keyboard
 */
var Keyboard = function (elem, noteKeys) {

  this.elem = elem;
  this.noteKeys = noteKeys;

  var that = this,
    touchEnabled = document.body.parentElement.classList.contains("touch") || ("touchstart" in window),
    press = touchEnabled ? "touchstart" : "mousedown",
    release = touchEnabled ? "touchend" : "mouseup",
    keyCodes = [];

  // map noteKeys to keyCodes
  for (keyId in noteKeys) {
    keyCodes[noteKeys[keyId].k] = {
      id: keyId,
      cents: noteKeys[keyId].cents
    }
  }

  elem.addEventListener(press, function (e) {
    that.triggerKeyEvent("press", e.target.id);
  });
  elem.addEventListener(release, function (e) {
    that.triggerKeyEvent("release", e.target.id);
  });
  document.addEventListener("keydown", function (e) {
    if (keyCodes[e.keyCode] && keyCodes[e.keyCode] !== null) {
      var id = keyCodes[e.keyCode].id;
      that.triggerKeyEvent("press", id, e);
    }
  });
  document.addEventListener("keyup", function (e) {
    if (keyCodes[e.keyCode] && keyCodes[e.keyCode] !== null) {
      var id = keyCodes[e.keyCode].id;
      that.triggerKeyEvent("release", id, e);
    }
  });
};
Keyboard.prototype = {
  triggerKeyEvent: function (type, id, originalEvent) {
    var el = document.getElementById(id),
      keyEvent = document.createEvent("Event"),
      mod = type === "press" ? "add" : "remove",
      eventName = type === "press" ? "synth.keydown" : "synth.keyup";
    el.classList[mod]("active");
    keyEvent.initEvent(eventName, false, false);
    keyEvent.keyId = id;
    keyEvent.cents = this.noteKeys[id].cents;
    keyEvent.originalEvent = originalEvent;
    document.dispatchEvent(keyEvent);
  }
};

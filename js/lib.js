/* library of utility classes and functions
 *
 * Interface, clone, extend, augment are from "Pro JavaScript Design Patterns" by Harmes and Diaz.
 */
var Interface = function(name, methods) {
  if(arguments.length != 2) {
    throw new Error("Interface constructor called with " + arguments.length
      + "arguments, but expected exactly 2.");
  }

  this.name = name;
  this.methods = [];
  for(var i = 0, len = methods.length; i < len; i++) {
    if(typeof methods[i] !== 'string') {
      throw new Error("Interface constructor expects method names to be "
        + "passed in as a string.");
    }
    this.methods.push(methods[i]);
  }
};
Interface.ensureImplements = function(object) { // Static class method.
  if(arguments.length < 2) {
    throw new Error("Function Interface.ensureImplements called with " +
      arguments.length  + "arguments, but expected at least 2.");
  }

  for(var i = 1, len = arguments.length; i < len; i++) {
    var interface = arguments[i];
    if(interface.constructor !== Interface) {
      throw new Error("Function Interface.ensureImplements expects arguments "
        + "two and above to be instances of Interface.");
    }

    for(var j = 0, methodsLen = interface.methods.length; j < methodsLen; j++) {
      var method = interface.methods[j];
      if(!object[method] || typeof object[method] !== 'function') {
        throw new Error("Function Interface.ensureImplements: object "
          + "does not implement the " + interface.name
          + " interface. Method " + method + " was not found.");
      }
    }
  }
};

/* classical inheritance with the extends() function
 *
 *
 * This is based on the extends function in Pro JavaScript Design Patterns by Harmes and Diaz,
 * but I added the properties argument to allow an easy way to declare additional methods.
 *
 * Note: within subclass constructors, you call the superclass constructor like so:
 * SubClass.superclass.constructor.call(this, [arg1], [arg2], ... )
 *
 */
function extend(subClass, superClass, properties) {
  var F = function() {};
  F.prototype = superClass.prototype;
  subClass.prototype = new F();
  subClass.prototype.constructor = subClass;

  subClass.superclass = superClass.prototype;
  if(superClass.prototype.constructor == Object.prototype.constructor) {
    superClass.prototype.constructor = superClass;
  }

  for (prop in properties) {
    subClass.prototype[prop] = properties[prop];
  }
}

var clone = function (obj) { // prototypal inheritance
  function F() {};
  F.prototype = object;
  return new F;
};

var augment = function (receivingClass, givingClass) { // mix-in inheritance
  if(arguments[2]) { // Only give certain methods.
    for (var i = 2, len = arguments.length; i < len; i++) {
      receivingClass.prototype[arguments[i]] = givingClass.prototype[arguments[i]];
    }
  }
  else { // Give all methods.
    for (methodName in givingClass.prototype) {
      if (!receivingClass.prototype[methodName]) {
        receivingClass.prototype[methodName] = givingClass.prototype[methodName];
      }
    }
  }
};

var override = function (obj, methods) {
  for (prop in literal) {
    obj.prototype[prop] = methods[prop];
  }
};

var capitalize = function (str) {
  return str[0].toUpperCase() + str.slice(1);
};

var hyphenToCamel = function (str) {
  var parts = str.split("-"),
    camel = parts[0];
  parts.forEach(function (part, i) {
    if (i !== 0) {
      camel += capitalize(part);
    }
  });
  return camel;
};



/* Arrays */

// from: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/max
var getMax = function (numArray) {
  return Math.max.apply(null, numArray);
};

var getMin = function (numArray) {
  return Math.min.apply(null, numArray);
};

var getAbsMax = function (numArray) {
  return Math.max( getMax(numArray), Math.abs(getMin(numArray)) );
};

var getAvg = function (numArray) {
  return numArray.reduce(function (a, b) { return a + b; }) / numArray.length;
};
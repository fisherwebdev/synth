/* Pool
 *
 */
var Pool = function () {

  this.pool = this.createPool();
  this.active = [];

};
Pool.prototype = {


  createPool: function () { // override this method in a subclass.
    return "a b c d e f g".split(' ');
  },


  isAvailable: function (id) {
    return this.active.every(function (item) {
      return item.id !== id;
    });
  },


  checkout: function (id) {
    var poolItem;
    if (this.pool.length > 0) {
      poolItem = this.pool.pop();
      this.active.push({
        id: id,
        item: poolItem
      });
    }
    return poolItem;
  },


  checkin: function (id) {
    var returnItem;
    this.active.forEach(function (item, index) {
      if (item.id === id) {
        returnItem = this.active.splice(index, 1)[0];
        this.pool.push(returnItem.item);
      }
    }, this);
    if (returnItem) {
      return returnItem.item;
    }
  }


};
/*
 * ccwx.DataContainer provides basic functional interface for collectionView and itemView, 
 * such as remove, delete, add, save
 * every dataContainer is bound with a dataSource (see dataSource.js)
 * subclass of this could feed this with callbacks or add more application-related function
 */

ccwx.DataContainer = (function () {

    // add "move" function to Array. Element in a list can be moved from one index to another index
    // NOTE each element is attached with an "index" property, which serves as a handy property to indexOf()
    Array.prototype.move = function (pos1, pos2) {

        var i, tmp;
        var test = this[0].index !== undefined;

        if (pos1 !== pos2 &&
            0 <= pos1 && pos1 <= this.length &&
            0 <= pos2 && pos2 <= this.length) {

            tmp = this[pos1];

            if (pos1 < pos2) {
                for (i = pos1; i < pos2; i++) {
                    this[i] = this[i + 1];
                    test && (this[i].index = i);
                }
            } else {
                for (i = pos1; i > pos2; i--) {
                    this[i] = this[i - 1];
                    test && (this[i].index = i);
                }
            }

            this[pos2] = tmp;
            test && (this[pos2].index = pos2);

            return true;

        } else {
            return false;
        }
    }  

    var DataContainer = function () {
    }

    DataContainer.prototype = {

        init: function (source, items) {

            this.source = source;
            this.items = items;
            
            if (this.onInited) {
                return this.onInited();
            }
        },

        save: function () {
            this.source.save();
        },

        deleteItem: function (item, silent) {

            var i = item.index;
            this.items.splice(i, 1);
            for (; i < this.items.length; i++) {
                this.items[i].index = i;
            };

            if (this.onItemDeleted) {
                return this.onItemDeleted(item);
            }
        },

        moveItem: function (pos1, pos2) {

            this.items.move(pos1, pos2);

            if (this.onItemMoved) {
                return this.onItemMoved(this.items[pos2], pos1, pos2);
            }
        },

        createItem: function () {

            var item = {
                index: this.items.length
            };
            this.items.push(item);

            if (this.onItemCreated) {
                return this.onItemCreated(item);
            }
        },

        addItem: function (item) {
            
            this.items.push(item);

            if (this.onItemAdded) {
                return this.onItemAdded(item);
            }
        }

    };

    return DataContainer;

})();
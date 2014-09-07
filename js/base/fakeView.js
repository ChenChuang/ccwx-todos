/*
 * see function ccwx.itemView._onSortStart. 
 * a fakeView has no element, it only plays as a placeholder when items are being sorted manually.
 */

ccwx.FakeView = (function() {

	var FakeView = function (view) {
		this.data = view.data;
	    this.height = view.height;
	    this.y = view.y;
	    this.collection = view.collection;
	};

	FakeView.prototype = {
		
		moveY: function (y) {
            this.y = y;
        },

		updatePosition: function (y, top) {

            if (y === undefined) {
                var y = this.collection.calViewPositionByIndex(this.data.index);
            }

            this.moveY(y);

        }
    };

    return FakeView;
})();
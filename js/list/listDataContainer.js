listPage.ListDataContainer = (function(){

	var ListDataContainer = function () {
	};

	ListDataContainer.prototype = $.extend(new ccwx.DataContainer(), {

		onInited: function () {
            this.updateUndoneNum();
		},

		onItemCreated: function (item) {
			var l = this.items.length;
			$.extend(item, {
	            title : '',
                items : [],
                undoneNum : 0
	        });
	        return item;
		},

        validate: function (item) {

            item.title = item.title.trim();
            if (item.title != '') {
                return true;
            }
            return false;
        },

        updateUndoneNum: function () {
            var i = this.items.length;
            while (i--) {
                var s = 0,
                    citems = this.items[i].items,
                    j = citems.length;
                    while (j--) {
                        if (!citems[j].done) {
                            s++;
                        };
                    }
                this.items[i].undoneNum = s;
            }
        }

	});

	return ListDataContainer;

})();




todoPage.TodoDataContainer = (function(){

	var TodoDataContainer = function () {
	};

	TodoDataContainer.prototype = $.extend(new ccwx.DataContainer(), {

		onInited: function () {
			this.updateDoneNum();
            document.title = app.dataSource.data.lists[todoPage.listIndex].title;
		},

		onItemDeleted: function (item) {

			item.done && this.doneNum--;
		},

		checkToggle: function (pos1, pos2) {

            var item = this.items[pos1];
            if (pos2 < this.doneNum && !item.done) {
                item.done = true;
                this.doneNum++;
            } else if (pos2 >= this.doneNum && item.done) {
                item.done = false;
                this.doneNum--;
            } else {
            	return false;
            }
            return true;
		},

		onItemCreated: function (item) {
			var l = this.items.length;
			$.extend(item, {
				prio : this.items[l-2] ? this.items[l-2].prio : '1',
	            content : '',
	            datetime : ''
	        });
	        return item;
		},

		updateDoneNum: function () {

            var i = this.items.length,
                s = 0;
            while (i--) {
                s += this.items[i].done ? 1 : 0;
            }
            this.doneNum = s;
            return s;
        },

        doneItem: function (item) {

            if (item.done) return;

            item.done = true;
            this.items.move(item.index, this.doneNum);
            this.doneNum++;

            return this.doneNum - 1;
        },

        undoneItem: function (item) {

            if (!item.done) return;

            item.done = false;
            this.items.move(item.index, this.doneNum - 1);
            this.doneNum--;

            return this.doneNum;
        },

        deleteItem: function (item, silent) {

            var i = item.index;

            this.items.splice(i, 1);
            for (; i < this.items.length; i++) {
                this.items[i].index = i;
            };

            var trash = app.dataSource.data.trash.items;
            t = {
                index: trash.length,
                prio: item.prio,
                datetime: item.datetime,
                content: item.content,
                list: app.dataSource.data.lists[todoPage.listIndex].title
            };
            trash.push(t);

            if (this.onItemDeleted) {
                return this.onItemDeleted(item);
            }
        },

        validate: function (item) {

            item.content = item.content.trim();
            if (item.content != '') {
                return true;
            }
            return false;
        }

	});

	return TodoDataContainer;

})();




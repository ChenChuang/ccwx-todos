trashPage.TrashDataContainer = (function(){

    var TrashDataContainer = function () {
    };

    TrashDataContainer.prototype = $.extend(new ccwx.DataContainer(), {

        onInited: function () {
            
            this.hash = {};

        },

        restoreItem: function (item) {
            
            var t = item.list,
                lists = app.dataSource.data.lists,
                i = lists.length;
            
            while (i--) {
                if (t === lists[i].title) {
                    break;
                }
            }

            var r = {
                prio: item.prio,
                datetime: item.datetime,
                content: item.content,
                done : false
            };

            if (i >= 0) {
                r.index = lists[i].items.length;
                lists[i].items.push(r);
            } else {
                lists.push({
                    title : t,
                    index : lists.length,
                    items : []
                });
                i = lists.length - 1;
                r.index = lists[i].items.length;
                lists[i].items.push(r);
            }

            this.deleteItem(item);
        },

    });

    return TrashDataContainer;

})();




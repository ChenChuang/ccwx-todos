trashPage.TrashCollectionView = (function () {

    var options = {
        viewType : trashPage.TrashItemView,
        idPrefix : "trash-item-",
    };

    var TrashCollectionView = function () {

    };

    TrashCollectionView.prototype = $.extend(new ccwx.CollectionView(options), {
        
        onInited: function () {
            this.updateTitle();
        },

        beforeDragEnd: function () {

            this.resetDragStates();

            if (this.y >= ccwx.TOP_SLIDE_OFFSET && this.views.length > 0) {
                this.clearAll();
            }

            this.updateBounds();
            return false;
        },

        clearAll: function () {
            if (confirm('Are you sure to clear all ?')) {
                var i = this.views.length,
                    v;
                while (i--) {
                    v = this.views[i];
                    ccwx.db.restoreItem(v.data);
                    ccwx.db.save();
                    v.el.remove();
                }
            }
        },

        updateTitle: function () {
            if (this.views.length === 0) {
                ccwx.SLIDER_TITLE_1 = ccwx.SLIDER_TITLE_2 = 'Trash is Empty';
                this.topSlider.html(ccwx.SLIDER_TITLE_1);
            } else {
                ccwx.SLIDER_TITLE_1 = 'Pull to Clear';
                ccwx.SLIDER_TITLE_2 = 'Release to Clear';
                this.topSlider.html(ccwx.SLIDER_TITLE_1);
            }
        },

    });

    return TrashCollectionView;

})();






todoPage.TodoCollectionView = (function () {

    var options = {
        viewType : todoPage.TodoItemView,
        idPrefix : "todo-item-",
    };

    var TodoCollectionView = function () {

    };

    TodoCollectionView.prototype = $.extend(new ccwx.CollectionView(options), {

        render: function () {

        },

        beforeViewCreated: function () {

            this.topSlider.html('Pull to Create');

            this.el.addClass('instant');
            var i = this.views.length,
                v;

            var self = this;
            setTimeout(function () {
                self.el.removeClass('instant');
            }, 0);

        },

        afterViewCreated: function (v) {
            
            //this._onTransitionEnd(function () {
            v.onEditStart(true, true);
            //});
            //this.moveY(0);
            //setTimeout(function () {
            //    v.onEditStart(true, true);
            //}, 100);
        },

        beforeDragEnd: function () {

            this.resetDragStates();

            if (this.y >= ccwx.TOP_SLIDE_OFFSET) {
                this.createView(ccwx.db.createItem());
                return true;
            }
            return false;
        },

        afterDragEndAni: function () {

        },

        onEditStart: function (noRemember) {

            beforeEditPosition = noRemember ? 0 : this.y;

            // Reason for using a setTimeout here: (or at least what I think is the case)
            // It seems in iOS browsers when you trigger the keyboard for the first time,
            // there's some heavy initialization work going on. This function is called
            // from the function that was initially triggered by the input focus event,
            // so the css transitions triggered here will be blocked. I'm avoiding that
            // by putting the class changes into a new call stack.

            /*
            var self = this;
            setTimeout(function () {

                // If on desktop, move currently focused item to top.
                // mobile devices will do auto page re-positioning on focus
                // and since behavior across different devices will vary,
                // better leave it alone here.

                if (noRemember) {
                    self.el
                        .removeClass('drag')
                        .addClass('ease-out');
                    self.moveY(0);
                    self._onTransitionEnd(function () {
                        self.el.removeClass('ease-out');
                    });
                }
            }, 0);*/

            this.updateBounds();
            this.updatePosition();

        },

        onEditDone: function () {

            if (!ccwx.client.isTouch) {
                this.moveY(beforeEditPosition);
            }

            this.updatePosition();
            this.updateBounds();

        }

    });

    return TodoCollectionView;

})();






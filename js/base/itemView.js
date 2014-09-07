/*
 * The ccwx.ItemView works with ccwx.collectionView to provide a scrollable and sortable list.
 * Multiple ItemViews will serve as items (or rows) of the list.
 * "Card" is the fundamental concept in my design. Every item in a list is a card. 
 * Cards could be of variable sizes and contents. 
 * We provide some common features of Card in ccwx.ItemView, such as slider and panels. 
 * The slider of a card can be slided to reveal the panel and trigger some actions.
 */

ccwx.ItemView = (function (raf) {



    // constructor
    var ItemView = function () {

    };

    // prototype
    ItemView.prototype = {

        // init the whole card with data and template
        init: function (data, tpl) {

            // left and right action-trigger bounds.
            this.leftBound = - ccwx.RIGHT_PANEL_WIDTH,
            this.rightBound = ccwx.LEFT_PANEL_WIDTH;

            // threshold to decide when to sroll the list automatically when cards are being sorted.
            this.upperSortMoveThreshold = ccwx.TOP_SLIDE_OFFSET * 1.5,
            this.lowerSortMoveThreshold = ccwx.TOP_SLIDE_OFFSET * 2.5;

            // create the DOM element of this card
            this.el = $(tpl);

            // x position of the slider
            this.x = 0;

            // y position of the card
            this.y = 0;

            // height of the card, being used to calculate its y position by collectionView
            this.height = 0;

            // bind the data 1-1
            this.data = data;

            // cache the main DOM elements and their styles.
            this.$style = this.el[0].style;

            // actually, this is the "Card"
            this.$wrapper = this.el.find('.card-wrapper');
            this.$wrapperStyle = this.$wrapper[0].style;

            // actually, this is the "Slider"
            this.$card = this.el.find('.card');
            this.$cardStyle = this.$card[0].style;

            // left panel
            this.$leftPanel = this.el.find('.left-panel');
            this.$leftPanelStyle = this.$leftPanel[0].style;

            // right panel
            this.$rightPanel = this.el.find('.right-panel');
            this.$rightPanelStyle = this.$rightPanel[0].style;

            // x position of the panels
            this.leftPanelX = 0;
            this.rightPanelX = 0;

            // subclass will render its contents in the card here
            this.render && this.render();
        },

        // Important function to refresh the card's height when its content is changed.
        // Sometimes subclass should override this function to provide more accurate calculation.
        calHeight: function () {

            this.height = this.el.height();
        },

        // move the y position of this card, which is absolute-positioned, using translate3d.
        // It is said that "translate3d" outperforms "top" by using somg-hardware-booming. Need more probing.
        moveY: function (y) {

            this.y = y;
            this.$style[ccwx.client.transformProperty] = 'translate3d(0px,' + y + 'px,0px)';
        },

        // move slider horizontally
        moveX: function (x) {

            this.x = x;
            this.$cardStyle[ccwx.client.transformProperty] = 'translate3d(' + x + 'px,0px,0px)';
        },

        restoreX: function (doneCallback) {
            var self = this;

            console.log('restoreX');

            this.moveLeftPanel(0);
            this.moveRightPanel(0);
            
            loop();

            function loop () {

                if (Math.abs(self.x) > 0.1) {
                    raf(loop);
                    self.moveX(self.x * .6);
                } else {
                    self.moveX(0);
                    self.$card.removeClass('drag');

                    if (doneCallback) doneCallback();

                }
            }
        },

        // move left panel
        moveLeftPanel: function (x) {

            this.leftPanelX = x;
            this.$leftPanelStyle[ccwx.client.transformProperty] = 'translate3d(' + x + 'px,0px,0px)';
        },

        // move right panel
        moveRightPanel: function (x) {

            this.rightPanelX = x;
            this.$rightPanelStyle[ccwx.client.transformProperty] = 'translate3d(' + x + 'px,0px,0px)';
        },

        // update the y position of the card
        updatePosition: function (y, top) {

            if (top) {
                this.el.addClass('top');
            }

            if (y === undefined) {
                var y = this.collection.calViewPositionByIndex(this.data.index);
            }

            if (y === this.y) {
                return false;
            }
            this.moveY(y);

            if (top) {
                this._onTransitionEnd(function (t) {
                    t.el.removeClass('top');
                });
            }
            return true;
        },

        // delete the card from DOM, animating right to left
        deleteSelf: function (callback) {

            var self = this;

            this.$style[ccwx.client.transformProperty] = 'translate3d(' + (-ccwx.width) + 'px,' + this.y + 'px, 0)';

            this._onTransitionEnd(function (self) {
                ccwx.db.deleteItem(self.data);
                ccwx.db.save();
                self.collection.deleteView(self);
                callback && callback();
            });

        },

        // check if the fakeView is following the card when sorting
        checkSwap: function () {

            var currentAt = this.collection.calViewIndexByHeightY(this.height, this.y),
                fakeAt = this.data.index;

            if (currentAt != fakeAt) {

                this.beforeItemSwap && this.beforeItemSwap(fakeAt, currentAt);

                ccwx.db.moveItem(fakeAt, currentAt);                
                this.collection.moveView(fakeAt, currentAt);
                this.collection.updatePositionBetween(fakeAt, currentAt);
                
                this.afterItemSwap && this.afterItemSwap(fakeAt, currentAt);
            }

        },

        // invoked when the slider is dragged
        _onDragStart: function () {

            this.beforeDragStart && this.beforeDragStart();

            this.$card.addClass('drag');
            this.moveLeftPanel(0);
            this.moveRightPanel(0);

            this.afterDragStart && this.afterDragStart();
        },

        // invoked when the slider is slided
        _onDragMove: function (dx) {

            this.beforeDragMove && this.beforeDragMove(dx);

            var tx = this.x + dx;

            if (this.noDragRight && tx > 0) return;
            if (this.noDragLeft && tx < 0) return;

            if (tx > 0) { // dragging to right

                if (this.noDragRight) return;
                if (tx <= this.rightBound) {

                    if (this.leftPanelX != 0) {
                        this.moveLeftPanel(0);
                    }

                } else { // over bound

                    // damp the dx to a third
                    dx /= 3;
                    this.moveLeftPanel(Math.max(0, (this.x + dx) - this.rightBound));

                }

            } else if (tx < 0) { // dragging to left

                if (this.noDragLeft) return;
                if (tx >= this.leftBound) {

                    if (this.rightPanelX != 0) {
                        this.moveRightPanel(0);
                    }

                } else { // over bound

                    dx /= 3;
                    this.moveRightPanel(Math.min(0, (this.x + dx) - this.leftBound));

                }

            }

            this.moveX(this.x + dx);

            this.afterDragMove && this.afterDragMove(dx);

        },

        // invoked when the slider dropped. check here to see if the action in the panel should be triggered
        _onDragEnd: function () {

            this.beforeDragEnd && this.beforeDragEnd();

            var leftImmediate = true, 
                rightImmediate = false;

            var self = this,
                doneCallback = null;

            if (this.x < this.leftBound) {
                if (leftImmediate) {
                    this.onDragLeftSucc && this.onDragLeftSucc();
                    return;
                }
                doneCallback = function () {
                    self.onDragLeftSucc && self.onDragLeftSucc();
                }
            } else if (this.x > this.rightBound) {
                if (rightImmediate) {
                    this.onDragRightSucc && this.onDragRightSucc();
                    return;
                }
                doneCallback = function () {
                    self.onDragRightSucc && self.onDragRightSucc();
                }
            }

            this.restoreX(doneCallback);

            this.afterDragEnd && this.afterDragEnd();
        },

        // invoked when sorting starts. e.g. when the card is picked up.
        _onSortStart: function () {

            this.beforeSortStart && this.beforeSortStart();

            this.el
                .addClass('sorting-trans')
                .addClass('sorting');

            // a "FakeView" is used to take the card's place in the list. 
            // Only one rule: the fake one will try its best to catch up the real card as it is dragged and moved up and down by user.
            this.fake = new ccwx.FakeView(this);
            this.collection.fakeView(this, this.fake);

            this.afterSortStart && this.afterSortStart();
        },

        // invoked when user's finger moves in sorting.
        _onSortMove: function (dy) {

            this.beforeSortMove && this.beforeSortMove(dy);

            this.moveY(this.y + dy);

            var col = this.collection,
                cy = col.y,
                ay = this.y + cy; // the actual on screen y

            if (cy < 0 && ay < this.upperSortMoveThreshold && dy < 3) {
                // upper move trigger is 1.5x line height
                // dy < 3 : makes sure upmove only triggers when user moves the dragged item upwards.
                // the 3px gives a small buffer for incidental downward movements
                if (!col.sortMoving) {
                    col.sortMove(1, this);
                }
            } else if (cy > col.upperBound && ay > ccwx.height - this.lowerSortMoveThreshold && dy > -3) {
                // the lower move trigger needs to count in the extra one line of space, thus an extra item height
                if (!col.sortMoving) {
                    col.sortMove(-1, this);
                }
            } else {
                col.sortMoving = false;
                this.checkSwap();
            }

            this.afterSortMove && this.afterSortMove(dy);

        },

        // when sorting ends
        _onSortEnd: function () {

            this.collection.sortMoving = false;
            this.collection.unfakeView(this);
            
            this.el.removeClass('sorting');

            if (this.updatePosition()) {
                this._onTransitionEnd(function (self) {
                    self.el.removeClass('sorting-trans');
                });
            } else {
                this.el.removeClass('sorting-trans');
            }

        },

        // when the card is tap. subclass can look into which element is tapped in "onTap" method
        _onTap: function (event) {
            this.onTap && this.onTap(event);
        },

        // when the card losts focus
        _onBlur: function (event) {
            this.onBlur && this.onBlur(event);
        },

        // a handy function to attach callback to transitionEnd event
        _onTransitionEnd: function (callback, noStrict) {

            var self = this;
            self.el.on(ccwx.client.transitionEndEvent, function (e) {

                if (e.target !== this && !noStrict) return;
                self.el.off(ccwx.client.transitionEndEvent);
                callback(self);
            });

        }

    };

    return ItemView;

}(ccwx.raf));











// see itemView.js

ccwx.CollectionView = (function (raf) {

    var dragElasticity      = 0.45,
        topDragElasticity   = 0.50,
        friction            = 0.95,
        speedMultiplier     = 16,
        maxSpeed            = 35,
        diff                = 0.5, // the min distance from target an animation loop chain should reach before ending
        sortMoveSpeed       = 4.5;

    var beforeEditPosition  = 0; // used to record position before edit focus

    // viewType should be subclass of ccwx.ItemView
    var CollectionView = function (options) {
        this.viewType = options.viewType || ccwx.ItemView;
        this.idPrefix = options.idPrefix;
        if (this.idPrefix === undefined || this.idPrefix === null) {
            this.idPrefix = "ccwx-item-";
        }
    };

    CollectionView.prototype = {

        init: function () {

            this.y = 0;
            this.topSliderY = 0;
            this.height = 0;
            this.upperBound = 0;
            this.initiated = false;

            this.data = ccwx.db.items;

            this.el = ccwx.$wrapper.find('.collection');
            this.el.replaceWith("<div class='collection'></div>");
            this.el = ccwx.$wrapper.find('.collection');
            this.style = this.el[0].style;
            this.topSlider = ccwx.$wrapper.find('.top-slider');
            this.topSliderStyle = this.topSlider[0].style;

            this.moveY(0);

            this.views = [];
            
            this.render && this.render();
            
            this.renderViews();

            this.resetDragStates();

            this.onInited && this.onInited();

        },

        resetDragStates: function () {

            this.pullingDown = false;
            this.pastPullDownThreshold = false;
            //this.topSlider.hide();
        },

        renderViews: function () {

            var items = this.data,
                i = items.length,
                v;

            this.hash = {};
            this.newId = i;

            while (i--) {
                v = this.addView(this.height, items[i]);
                this.height += v.height;
            }
            this.views.reverse();

            this.updateBounds();
        },

        // addView at a specific y position with some data binded, truely serves as a handy function in this scope
        addView: function (y, data) {

            var v = new this.viewType(data);

            v.collection = this;
            v.$wrapper.data('id', this.idPrefix + this.newId);

            this.hash[this.idPrefix + this.newId] = v;
            this.newId++;

            v.el.appendTo(this.el);
            v.updatePosition(y);
            v.calHeight();

            this.views.push(v);

            return v;

        },

        // create a new card at top. Maybe it's better to call it "prependView"
        createView: function (data) {
            var self = this;
            
            /*this.el.removeClass('drag');

            

            this._onTransitionEnd(function () {
                self.beforeViewCreated && self.beforeViewCreated();

                var v = self.addView(0, data);

                self.updatePosition();
                self.updateBounds(true);

                self.afterViewCreated && self.afterViewCreated(v);
            });*/

            this.moveY(0);

            self.beforeViewCreated && self.beforeViewCreated();

                var v = self.addView(0, data);

                self.updatePosition();
                self.updateBounds(true);

                self.afterViewCreated && self.afterViewCreated(v);
        },

        // delete the card from list
        deleteView: function (v) {
            var i = v.data.index;
            this.views.splice(i, 1);
            v.el.remove();

            this.onViewDeleted && this.onViewDeleted(v);

            this.updatePositionBetween(i-1, 0);
            this.updateBounds();
        },

        // move a card from one index to another
        moveView: function (pos1, pos2) {
            this.views.move(pos1, pos2);

            this.onViewMoved && this.onViewMoved(pos1, pos2);

            this.updatePositionBetween(pos1, pos2);
        },

        // important function! calculate a card's y position by its index in the list.
        // a bold assumption: y position of the card upon this card is calculated correctly.
        calViewPositionByIndex: function (index) {
            var v = this.views[index + 1];
            if (v) {
                return v.y + v.height;
            }
            return 0;
        },

        // calculate the index of a card, if the card is in the list. invoked by ccwx.itemView.checkswap()
        calViewIndexByHeightY: function (h, y) {
            var i = this.views.length,
                pre = - h / 2,
                target = y + h / 2;
            while (i--) {
                cur = this.views[i].height / 2 + this.views[i].y;
                if (pre < target && target < cur) {
                    return i;
                };
                pre = cur;
            }
            return 0;
        },

        // "Id" here is refered to the id property of the element of a card. 
        // invoked by touch.js to find out which card's controller should be invoked when a card is tapped.
        getViewById: function (id) {
            return this.hash[id];
        },

        // handy function
        getViewsBetweenIndex: function (origin, target) {
            return this.views.slice(origin, target);
        },

        // update y position of all cards
        updatePosition: function () {

            var i = this.views.length;
            while (i--) {
                this.views[i].updatePosition();
            }

        },

        // move the whole list, not the cards one by one !
        moveY: function (y) {
            this.y = y;
            this.style[ccwx.client.transformProperty] = 'translate3d(0px,' + (ccwx.TOP_OFFSET + y) + 'px, 0px)';

        },

        // move the slider above the list, we provide pull-to-refresh feature
        moveTopSliderY: function (y) {
            this.topSliderY = y;
            this.topSliderStyle[ccwx.client.transformProperty] = 'translate3d(0px,' + y + 'px, 0px)';
        }, 

        // only update some of the cards, more effecient if we can guarantee that other cards will remain
        updatePositionBetween: function (from, to) {

            var views = this.views,
                i = Math.max(from, to),
                to = Math.min(from, to),
                v;

            for (; i >= to; i--) {
                v = views[i];
                v && v.updatePosition();
            }

        },

        // update the upper bound of the list
        updateBounds: function (noMove) {

            var lv = this.views[0];
            this.height = lv ? lv.y + lv.height + ccwx.BOTTOM_OFFSET: 0;
            //this.height = Math.max(ccwx.height, this.height);

            this.style.height = this.height + 'px';

            this.upperBound = Math.min(0, ccwx.height - (this.height + ccwx.TOP_SLIDE_OFFSET));

            if (this.y < this.upperBound && !noMove) {
                this.moveY(this.upperBound);
            }
            this.moveTopSliderY(0);
            this.topSlider.html(ccwx.SLIDER_TITLE_1);
        },

        // replace one of card with a fake card
        fakeView: function (view, fake) {
            this.views[view.data.index] = fake;
        },

        // restore the real card
        unfakeView: function (view) {
            this.views[view.data.index] = view;
        },

        // automatically scroll when user drag a sorting card to edge of screen
        sortMove: function (dir, target) {
            
            var self = this,
                dy  = dir * sortMoveSpeed;

            self.sortMoving = true;
            self.el.addClass('drag');
            loop();

            function loop () {

                if (!self.sortMoving) {
                    self.el.removeClass('drag');
                    return;
                }

                raf(loop);

                var cty = Math.max(self.upperBound, Math.min(0, self.y + dy));

                target.moveY(target.y - (cty - self.y));
                target.checkSwap();

                self.moveY(cty);

            }

        },

        _onDragStart: function () {

            this.beforeDragStart && this.beforeDragStart();

            this.el.addClass('drag');

            this.afterDragStart && this.afterDragStart();
        },

        _onDragMove: function (dy) {

            this.beforeDragMove && this.beforeDragMove(dy);

            if (this.y + dy < this.upperBound || this.y + dy > 0) {
                dy *= dragElasticity;
            }

            this.moveY(this.y + dy);

            if (this.y > 0) {
                if (!this.pullingDown) {
                    this.pullingDown = true;
                }
                if (this.y <= ccwx.TOP_SLIDE_OFFSET) {
                    if (this.pastPullDownThreshold) {
                        this.pastPullDownThreshold = false;
                        this.topSlider.html(ccwx.SLIDER_TITLE_1);
                        //this.topSlider.show();
                    }
                } else {
                    if (!this.pastPullDownThreshold) {
                        this.pastPullDownThreshold = true;
                        this.topSlider.html(ccwx.SLIDER_TITLE_2);
                        //this.topSlider.show();
                    }
                    this.moveTopSliderY(this.topSliderY + dy * topDragElasticity);
                }
            } else {
                //this.topSlider.hide();
                if (this.pullingDown) {
                    this.pullingDown = false;
                }
            }

            this.afterDragMove && this.afterDragMove(dy);

        },

        _onDragEnd: function (speed) {

            var noGoOn = this.beforeDragEnd && this.beforeDragEnd(speed);

            if (noGoOn) {
                return;
            }

            var self = this;
            speed = Math.max(-maxSpeed, Math.min(maxSpeed, speed * speedMultiplier));

            self.inMomentum = true;

            function loop () {

                if (ccwx.touch.isDown) {
                    endLoop();
                    return;
                }

                if (self.y < self.upperBound - diff) { // dragged over bottom
                    self.y += (self.upperBound - self.y) / 5; // apply elastic bounce back
                    speed *= .85; // apply additional friction
                    if (self.y < self.upperBound - diff) {
                        raf(loop);
                        render();
                    } else {
                        self.moveY(self.upperBound);
                        endLoop();
                    }
                } else if (self.y > diff) { // dragged over top
                    self.y *= .8;
                    speed *= .85;
                    if (self.y > diff) {
                        raf(loop);
                        render();
                    } else {
                        self.moveY(0);
                        endLoop();
                    }
                } else if (Math.abs(speed) > 0.1) { // normal moving
                    raf(loop);
                    render();
                } else { // natural stop due to friction
                    endLoop();
                    this.afterDragEndAni && this.afterDragEndAni();
                }

            };

            function endLoop () {
                self.el.removeClass('drag');
                self.inMomentum = false;
            };

            function render () {
                self.moveY(self.y + speed);
                speed *= friction;
            };

            loop();

            this.afterDragEnd && this.afterDragEnd(speed);
        },

        _onTap: function (event) {

        },

        _onTransitionEnd: function (callback, noStrict) {

            var self = this;
            self.el.on(ccwx.client.transitionEndEvent, function (e) {
                if (e.target !== this && !noStrict) return;
                self.el.off(ccwx.client.transitionEndEvent);
                callback();
            });

        }

    };

    return CollectionView;

}(ccwx.raf));











trashPage.TrashItemView = (function () {

    var prioColor = {
        0 : '#ee7777',
        1 : '#22cc22',
        2 : '#7777ee'
    };

    var prioColorLen = 3;

    var leftBound = -trashPage.LEFT_PANEL_WIDTH,
        rightBound = trashPage.RIGHT_PANEL_WIDTH;

    var tpl = $('#trash-item-tpl').html();

    var TrashItemView = function (data) {

        this.init(data, tpl);
    };

    TrashItemView.prototype = $.extend(new ccwx.ItemView(), {

        render: function () {

            this.$card = this.el.find('.card');
            this.$leftBtn = this.el.find('.left-panel').find('.fa');
            this.$title = this.$card.find('.title');
            this.$content = this.$card.find('.content');

            this.$prioLb = this.$title.find('.prio-lb');

            this.$dateLb = this.$title.find('.date-lb');
            this.$timeLb = this.$title.find('.time-lb');

            this.$caleLb = this.$title.find('.cale-lb');

            this.$dtLine = this.$title.find('.line-span');
            
            
            this.$content.text(this.data.content);

            this.$prioLb[0].style.color = prioColor[this.data.prio];

            this.renderDatetimeLb();

            this.el.addClass('done');
            this.$leftBtn.removeClass('fa-check-check').addClass('fa-arrow-circle-up');

        },

        renderDatetimeLb: function () {
            
            var f = true,
                g = true;

            var date = this.data.datetime.substr(5, 5);
            if (date.match(/\d\d-\d\d/)) {
                this.$dateLb.text(date);
                this.$dateLb[0].style.display = 'inline';
                f = f && false;
            } else {
                this.$dateLb[0].style.display = 'none';
                g = g && false;              
            }

            var time = this.data.datetime.substr(11, 5);
            if (time.match(/\d\d:\d\d/)) {
                this.$timeLb.text(time);
                this.$timeLb[0].style.display = 'inline';
                f = f && false;
            } else {
                this.$timeLb[0].style.display = 'none';
                g = g && false;
            }

            this.$caleLb[0].style.display = f ? 'inline' : 'none';
            this.$dtLine[0].style.display = g ? 'inline' : 'none';
        },

        calHeight: function () {

            var h = this.$card.height();
            this.$wrapperStyle['height'] = (h + 2) + 'px';
            this.height = this.el.height();
        },

        beforeDragMove: function (dx) {

            if (ccwx.touch.pinItemView) return;

            if (this.x >= rightBound) {
                if (!this.activated) {
                    this.activated = true;
                    this.el.removeClass('done');
                    this.el.removeClass('red');
                }
            } else if (this.x <= leftBound) {
                if (!this.activated) {
                    this.activated = true;
                    this.el.addClass('done');
                    this.el.addClass('red');
                }
            } else {
                if (this.activated) {
                    this.activated = false;
                    this.el.addClass('done');
                    this.el.removeClass('red');
                }
            }

        },

        onDragRightSucc: function () {

            this.restoreSelf();

        },

        onDragLeftSucc: function () {
            
            this.deleteSelf();
        },

        restoreSelf: function (callback) {
            var self = this;

            this.$style[ccwx.client.transformProperty] = 'translate3d(0px,' + (-this.height-20) + 'px, 0)';

            this._onTransitionEnd(function (self) {
                ccwx.db.restoreItem(self.data);
                ccwx.db.save();
                self.collection.deleteView(self);
                self.collection.updateTitle();
            });
        }

    });
    
    return TrashItemView;

})();










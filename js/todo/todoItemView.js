todoPage.TodoItemView = (function () {

    var prioColor = {
        0 : '#ee7777',
        1 : '#22cc22',
        2 : '#7777ee'
    };

    var prioColorLen = 3;

    var leftBound = -todoPage.LEFT_PANEL_WIDTH,
        rightBound = todoPage.RIGHT_PANEL_WIDTH;

    var tpl = $('#todo-item-tpl').html();

    var TodoItemView = function (data) {

        this.init(data, tpl);
    };

    TodoItemView.prototype = $.extend(new ccwx.ItemView(), {

        render: function () {

            this.$card = this.el.find('.card');
            this.$leftBtn = this.el.find('.left-panel').find('.fa');
            this.$title = this.$card.find('.title');
            this.$content = this.$card.find('.content');

            this.$prioLb = this.$title.find('.prio-lb');
            this.$prioBtn = this.$card.find('.prio-btn');

            this.$dateLb = this.$title.find('.date-lb');
            this.$timeLb = this.$title.find('.time-lb');

            this.$caleLb = this.$title.find('.cale-lb');
            this.$caleBtn = this.$card.find('.cale-btn');

            this.$dtLine = this.$title.find('.line-span');
            
            
            this.$content.text(this.data.content);

            this.$prioLb[0].style.color = prioColor[this.data.prio];

            this.renderDatetimeLb();

            this.renderDone();

            this.isNew = false;
        },

        renderDone: function () {

            if (this.data.done) {
                this.el.addClass('done');
                this.$leftBtn.removeClass('fa-check-check').addClass('fa-arrow-circle-up');
            } else {
                this.el.removeClass('done');
                this.$leftBtn.removeClass('fa-arrow-circle-up').addClass('fa-check-check');
            }
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

        onNew: function () {

            this.isNew = true;
            this.el.addClass('new-item-row');
        },

        offNew: function () {

            this.isNew = false;
            this.el.removeClass('new-item-row');
        },

        calHeight: function () {

            var h = this.$card.height();
            this.$wrapperStyle['height'] = (h + 2) + 'px';
            this.height = this.el.height();
        },

        onTap: function (event) {
            
            var self = this;

            if (this.data.done) {
                this.collection._onTap();
                return;
            }
            if (event.target === this.$content[0]) {
                
                this.onEditStart();

            } else if (event.target === this.$prioBtn[0]) {
                
                this.data.prio = (this.data.prio + 1) % prioColorLen;
                this.$prioLb[0].style.color = prioColor[this.data.prio];

                if (this.prioTimeout) {
                    clearTimeout(this.prioTimeout);
                    this.prioTimeout = null;
                }

                this.prioTimeout = setTimeout(function(){
                    ccwx.db.save();
                }, 700);

            } else if (event.target === this.$caleBtn[0] || 
                
                event.target === this.$dateLb[0] || 
                event.target === this.$timeLb[0]) {
                this.onDatetimeStart();

            } else if (event.target !== this.$contentInput[0]){

                this.onBlur();
            }
        },

        onDatetimeStart: function () {
            ccwx.touch.isEditing = true;
            todoPage.$datetimeInput.focus();
            
            var self = this;
            
            todoPage.$datetimeInput.off('change').off('blur');
            todoPage.$datetimeInput.
                on('change', function () {
                    self.onDatetimeChange();
                }).
                on('blur',  function () {
                    self.onDatetimeEnd();
                });
        },

        onDatetimeEnd: function () {
            ccwx.touch.isEditing = false;
            this.onDatetimeChange();
            ccwx.db.save();
        },

        onDatetimeChange: function () {
            var str = todoPage.$datetimeInput[0].value;
            this.data.datetime = str.substr(0, 10) + 'T' + str.substr(11, 8);
            // this.data.datetime = str.substr(0, 16);
            this.renderDatetimeLb();
        },

        // Pretty weird: does "blur" event fired before "touchstart" or inversly ??
        // whatever, we handle them by checking ccwx.touch.isEditing
        onBlur: function (event) {
            if (ccwx.touch.pinItemView === this) {
                //ccwx.touch.pinItemView = null;
            }
            if (this.isEditing) {
                this.onEditDone();
            }
            if (!ccwx.db.validate(this.data)) {
                this.deleteSelf(function () {
                    ccwx.touch.pinItemView = null;
                });
            } 
        },

        beforeDragMove: function (dx) {

            if (ccwx.touch.pinItemView) return;

            if (this.x >= rightBound) {
                if (!this.activated) {
                    this.activated = true;
                    if (this.data.done) {
                        this.el.removeClass('done');
                    } else {
                        this.el.addClass('green');
                    }
                    this.el.removeClass('red');
                }
            } else if (this.x <= leftBound) {
                if (!this.activated) {
                    this.activated = true;
                    if (this.data.done) {
                        this.el.addClass('done');
                    } else {
                        this.el.removeClass('green');
                    }
                    this.el.addClass('red');
                }
            } else {
                if (this.activated) {
                    this.activated = false;
                    if (this.data.done) {
                        this.el.addClass('done');
                    } else {
                        this.el.removeClass('green');
                    }
                    this.el.removeClass('red');
                }
            }

        },

        beforeSortEnd: function () {

            if (!this.data.done) {
                if (this.order >= this.collection.count) { // dragged into done zone
                    this.beDone();
                }
            } else {
                if (this.order < this.collection.count) { // dragged back into undone zone!
                    this.unDone();
                }
            }

            ccwx.db.save();
        },

        onDragRightSucc: function () {  // this is todoItem specific

            if (!this.data.done) {
                var pos1 = this.data.index;
                var pos2 = ccwx.db.doneItem(this.data);
                this.el.removeClass('green');
                this.renderDone();
                this.collection.moveView(pos1, pos2);
            } else {
                var pos1 = this.data.index;
                var pos2 = ccwx.db.undoneItem(this.data);
                this.renderDone();
                this.collection.moveView(pos1, pos2);
            }

            ccwx.db.save();

        },

        // delete the card and its data
        onDragLeftSucc: function () {
            
            this.deleteSelf();
        },

        // when card moves, check if it needs to be refreshed UI.
        beforeItemSwap: function (pos1, pos2) {
            var toggle = ccwx.db.checkToggle(pos1, pos2);
            if (toggle) {
               this.renderDone();
            }
        },        

        // noRemember:
        // tells parent collection to ignore starting position and always move to 0 when edit is done.
        onEditStart: function (noRemember, isnew) {

            if (this.isEditing) {
                return;
            }

            ccwx.touch.isEditing = true;
            this.isEditing = true;

            /*
            $(document.body).off('touchmove');
            $(document.body).on('touchmove', function (event) {
                console.log(event.target);
                if (event.target !== this.$contentInput[0]) {
                    event.preventDefault();
                }
            });*/

            ccwx.touch.pinItemView = this;
            var self = this;

            if (!this.$contentInput) {
                this.$contentInput = $('<textarea />');
                this.$contentInput.addClass('content selectable');
                
                this.$contentInput.on('blur', function () {
                    self.onEditDone();
                });
                this.$contentInput.on('keyup', function (e) {
                    if (e.keyCode === 13) {
                        $(this).blur();
                    }
                });
            }

            var h = this.$content.height(),
                w = this.$content.width();
            this.$contentInput.text(this.$content.html());
            this.$content.replaceWith(this.$contentInput);
            
            self.$contentInput.focus();
            //self.moveCaretToBegin(self.$contentInput[0]);
            self.$contentInput.select();
            
            this.el.addClass('edit');

            if (!isnew) {                
                this.$contentInput.height(h);
                this.$contentInput.width(w);
            }

            this.calHeight();

            this.collection.onEditStart(noRemember);

        },

        // when the editor losts focus, invoke onEditDone to refresh UI
        // when the card losts focus, validate and save the data (or delete it).
        onEditDone: function () {
            
            if (!this.isEditing) {
                return;
            }

            setTimeout(function(){
                ccwx.touch.isEditing = false;
            }, 100);

            this.isEditing = false;

            /*
            $(document.body).on('touchmove', function (e) {
                e.preventDefault();
            });*/

            this.data.content = this.$contentInput[0].value;
            
            if (ccwx.db.validate(this.data)) {
                this.$content.text(this.data.content);
                this.$contentInput.replaceWith(this.$content);
                this.el.removeClass('edit');
                this.calHeight();
                this.collection.onEditDone();
                ccwx.db.save();
                ccwx.touch.pinItemView = null;
            }
        },

        moveCaretToBegin: function(el) {
            
            if (typeof el.selectionStart == 'number') {
                el.selectionStart = el.selectionEnd = 0;
            } else if (typeof el.createTextRange != 'undefined'){
                var range = el.createTextRange();
                range.collapse(true);
                range.select();
            }
        }

    });
    
    return TodoItemView;

})();










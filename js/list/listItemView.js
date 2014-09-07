listPage.ListItemView = (function () {

    var leftBound = -listPage.LEFT_PANEL_WIDTH,
        rightBound = listPage.RIGHT_PANEL_WIDTH;

    var tpl = $('#list-item-tpl').html();

    var ListItemView = function (data) {

        this.init(data, tpl);
    };

    ListItemView.prototype = $.extend(new ccwx.ItemView(), {

        render: function () {

            this.$card = this.el.find('.card');
            this.$rightBtn = this.el.find('.right-panel').find('.fa');
            this.$content = this.$card.find('.content');      
            
            this.$content.text(this.data.title);

            this.$undoneIndWrapper = this.el.find('.undone-indict');
            this.$undoneInd = this.el.find('.indict');
            this.renderUndoneNum();

            this.isNew = false;
        },

        renderUndoneNum: function () {
            this.$undoneInd.html(this.data.undoneNum + '');
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

            if (event.target === this.$content[0]) {
                this.onEditStart();
            } else if (event.target === this.$undoneInd[0]) {
                
                todoPage.listIndex = this.data.index;

                setTimeout(function(){
                    todoPage.init();
                    window.history.pushState({
                        index : todoPage.listIndex
                    }, "", document.location.href + '/' + todoPage.listIndex);
                }, 0);

            } else if (event.target !== this.$contentInput){
                this.onBlur();
            } 
        },

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

            if (this.x <= this.leftBound) {
                if (!this.activated) {
                    this.activated = true;
                    this.el.addClass('red');
                }
            } else if (this.activated) {
                this.activated = false;
                this.el.removeClass('red');
            }

        },

        beforeSortEnd: function () {

            ccwx.db.save();
        },

        onDragLeftSucc: function () {
            
            ccwx.touch.clear();
            ccwx.touch.pinItemView = this;

            if (confirm('Are you sure you want to delete the entire list?')) {
                this.deleteSelf(function(){
                    ccwx.touch.pinItemView = null;
                });
            } else {
                this.activated = false;
                this.el.removeClass('red');
                this.el.removeClass('sorting');
                this.restoreX(function(){
                    ccwx.touch.pinItemView = null;
                });
            }
            
        },        

        onEditStart: function (noRemember, isnew) {

            if (this.isEditing) {
                return;
            }

            ccwx.touch.isEditing = true;
            this.isEditing = true;

            ccwx.touch.pinItemView = this;
            var self = this;

            if (!this.$contentInput) {
                this.$contentInput = $('<input />');
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

            this.$undoneIndWrapper.hide();

            var h = this.$content.height(),
                w = this.$content.width();
            this.$contentInput.val(this.$content.html());
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

        onEditDone: function () {
            
            if (!this.isEditing) {
                return;
            }

            setTimeout(function(){
                ccwx.touch.isEditing = false;
            }, 100);

            this.isEditing = false;

            this.$undoneIndWrapper.show();

            this.data.title = this.$contentInput[0].value;
            
            if (ccwx.db.validate(this.data)) {
                this.$content.text(this.data.title);
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
    
    return ListItemView;

})();










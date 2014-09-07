/*
 * This todo web-app is composed of three pages: listPage, todoPage, trashPage. 
 * Any of the pages is fed with a data container class, a collection view class, an item view class.
 * Only several lines of code are need by inheriting from ccwx.*
 */
var listPage = {

    debug: window.location.hash.replace('#','') === 'debug',
    
    LEFT_PANEL_WIDTH : 0,
    RIGHT_PANEL_WIDTH : 40,
   
    isEditing : false,
    pinItemView : null,

    init : function () {
        
        document.title = 'Todos';

        $('#wrapper').ccwxListView({
        
            CollectionViewClass : listPage.ListCollectionView,
            ItemViewClass       : listPage.ListItemView,
            DataContainerClass  : listPage.ListDataContainer,

            dataSource          : app.dataSource,
            data                : app.dataSource.data.lists,

            LEFT_PANEL_WIDTH    : listPage.LEFT_PANEL_WIDTH,
            RIGHT_PANEL_WIDTH   : listPage.RIGHT_PANEL_WIDTH,

            BOTTOM_OFFSET       : 50,

            debug               : listPage.debug
        });

        this.$trashBtn = $('.trash');
        this.$trashBtn.show();

        this.$trashBtn.on('tap', function () {
            trashPage.init();
            window.history.pushState({
                trash : true
            }, "", document.location.href + '/trash');
        });
    },

    clear: function () {
        this.$trashBtn.off();
        this.$trashBtn.hide();
    }

};

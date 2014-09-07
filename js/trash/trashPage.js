var trashPage = {

    debug: window.location.hash.replace('#','') === 'debug',
    
    LEFT_PANEL_WIDTH : 40,
    RIGHT_PANEL_WIDTH : 40,

    init : function (listIndex) {

        listPage.clear();

        $('#wrapper').ccwxListView({
        
            CollectionViewClass : trashPage.TrashCollectionView,
            ItemViewClass       : trashPage.TrashItemView,
            DataContainerClass  : trashPage.TrashDataContainer,

            dataSource          : app.dataSource,
            data                : app.dataSource.data.trash.items,

            sortable            : false,

            LEFT_PANEL_WIDTH    : trashPage.LEFT_PANEL_WIDTH,
            RIGHT_PANEL_WIDTH   : trashPage.RIGHT_PANEL_WIDTH,

            SLIDER_TITLE_1      : 'Pull to Clear',
            SLIDER_TITLE_2      : 'Release to Clear',

            debug               : trashPage.debug
        });
    }

};

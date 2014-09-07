var todoPage = {

    debug: window.location.hash.replace('#','') === 'debug',
    //debug: (new RegExp("^debug/\\d*")).test(window.location.hash.replace('#','')),
    
    LEFT_PANEL_WIDTH : 40,
    RIGHT_PANEL_WIDTH : 40,

    $datetimeInput : $('.datetime-input'),

    listIndex : 0,

    init : function (listIndex) {

        listPage.clear();

        this.listIndex = listIndex || this.listIndex;

        $('#wrapper').ccwxListView({
        
            CollectionViewClass : todoPage.TodoCollectionView,
            ItemViewClass       : todoPage.TodoItemView,
            DataContainerClass  : todoPage.TodoDataContainer,

            dataSource          : app.dataSource,
            data                : app.dataSource.data.lists[this.listIndex].items,

            LEFT_PANEL_WIDTH    : todoPage.LEFT_PANEL_WIDTH,
            RIGHT_PANEL_WIDTH   : todoPage.RIGHT_PANEL_WIDTH,

            debug               : todoPage.debug
        });
    }

};

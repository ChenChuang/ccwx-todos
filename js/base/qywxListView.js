/*
 * ccwxListView can be bind to any DOM element by `$(selector).ccwxListView(options)`
 * see options below.
 */

ccwx = {
    raf : window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 16);
        }
};

$.extend($.fn, {

    ccwxListView : function (options) {

        options = $.extend({
            // you should inherit CollectionView, ItemView and DataContainer to add your features or callbacks
            CollectionViewClass : ccwx.CollectionView,
            ItemViewClass       : ccwx.ItemView,
            DataContainerClass  : ccwx.DataContainer,
            
            // class of datasource
            dataSource          : ccwx.DataSource,
            // feed data to datasource
            data                : [],            

            // UI related
            LEFT_PANEL_WIDTH    : 40,
            RIGHT_PANEL_WIDTH   : 40,
            TOP_SLIDE_OFFSET    : 40,
            TOP_OFFSET          : 20,
            BOTTOM_OFFSET       : 0,

            SLIDER_TITLE_1      : 'Pull to Create',
            SLIDER_TITLE_2      : 'Release to Create',

            debug               : false,

            sortable            : true,

            initClient          : true,
            initTouch           : true,
            db                  : null,
            collection          : null
            
        }, options);

        ccwx.$wrapper = this;

        ccwx.LEFT_PANEL_WIDTH = options.LEFT_PANEL_WIDTH;
        ccwx.RIGHT_PANEL_WIDTH = options.RIGHT_PANEL_WIDTH;
        ccwx.TOP_SLIDE_OFFSET = options.TOP_SLIDE_OFFSET;
        ccwx.TOP_OFFSET = options.TOP_OFFSET;
        ccwx.BOTTOM_OFFSET = options.BOTTOM_OFFSET;

        ccwx.SLIDER_TITLE_1 = options.SLIDER_TITLE_1;
        ccwx.SLIDER_TITLE_2 = options.SLIDER_TITLE_2;

        ccwx.debug = options.debug;

        ccwx.touch.clear();

        options.initClient && ccwx.client.init();
        
        options.initTouch && ccwx.touch.init();
        ccwx.touch.setSortable(options.sortable);

        ccwx.$wrapper[0].style.height = "";
        ccwx.height = this.height();
        ccwx.width = this.width();

        ccwx.db = options.db || new options.DataContainerClass();
        options.db || ccwx.db.init(options.dataSource, options.data);

        ccwx.collection = options.collection || new options.CollectionViewClass();
        options.collection || ccwx.collection.init();
    }
});
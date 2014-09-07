/*
 * some default data provided by our data source =.=
 */

var AppDataSource = (function(){

    var options = {
        localStorageKey : 'ccwx-checklist'
    };

    var DataSource = function () {

    };

    DataSource.prototype = $.extend(new ccwx.DataSource(options), {

        onLoaded: function () {
            
        },

        onReadDataFailed: function () {

            this.data = {
                lists: [
                    {
                        title: 'work',
                        index: 0,
                        items: [
                            {
                                index: 0,
                                prio: 0,
                                datetime: '2009-11-13T20:00Z',
                                content: 'Swipe right to complete Swipe right to complete Swipe right to complete Swipe right to complete'
                            },
                            {
                                index: 1,
                                prio: 1,
                                datetime: '2009-11-13T20:00Z',
                                content: 'Swipe left to delete'
                            },
                            {
                                index: 2,
                                prio: 0,
                                datetime: '2009-11-13T20:00Z',
                                content: 'Swipe left to delete'
                            },
                            {
                                index: 3,
                                prio: 2,
                                datetime: '2009-11-13T20:00Z',
                                content: 'Swipe left to delete'
                            },
                            {
                                index: 4,
                                prio: 2,
                                datetime: '2009-11-13T20:00Z',
                                content: 'Swipe left to delete'
                            },
                            {
                                index: 5,
                                prio: 1,
                                datetime: '2009-11-13T20:00Z',
                                content: 'Swipe left to delete'
                            },
                            {
                                index: 6,
                                prio: 0,
                                datetime: '2009-11-13T20:00Z',
                                content: 'Swipe left to delete'
                            },
                            {
                                index: 7,
                                prio: 1,
                                datetime: '2009-11-13T20:00Z',
                                content: 'Swipe left to delete'
                            },
                            {
                                index: 8,
                                prio: 0,
                                datetime: '2009-11-13T20:00Z',
                                content: 'Swipe left to delete'
                            }
                        ]
                    },
                    {
                        title: 'family',
                        index: 1,
                        items: [
                            {
                                index: 0,
                                prio: 0,
                                datetime: '2009-11-13T20:00Z',
                                content: 'Swipe right to complete Swipe right to complete Swipe right to complete Swipe right to complete'
                            },
                            {
                                index: 1,
                                prio: 1,
                                datetime: '2009-11-13T20:00Z',
                                content: 'Swipe left to delete'
                            },
                            {
                                index: 2,
                                prio: 0,
                                datetime: '2009-11-13T20:00Z',
                                content: 'Swipe left to delete'
                            }
                        ]
                    }
                ],
                trash: {
                    items: [
                        {
                            index: 0,
                            list: 'family',
                            prio: 0,
                            datetime: '2009-11-13T20:00Z',
                            content: 'Swipe right to complete Swipe right to complete Swipe right to complete Swipe right to complete'
                        },
                        {
                            index: 1,
                            list: 'work',
                            prio: 1,
                            datetime: '2009-11-13T20:00Z',
                            content: 'Swipe left to delete'
                        },
                        {
                            index: 2,
                            list: 'unknown',
                            prio: 0,
                            datetime: '2009-11-13T20:00Z',
                            content: 'Swipe left to delete'
                        }
                    ]
                }
            };
            this.save();
        }

    });

    return DataSource;

})();




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
                                content: 'Swipe right to complete, Swipe left to delete, Long tap and move to sort, Drag down to create'
                            },
                            {
                                index: 1,
                                prio: 2,
                                datetime: '2013-05-08T20:08Z',
                                content: 'Sleep sleep sleep and eat'
                            },
                            {
                                index: 2,
                                prio: 1,
                                datetime: '2014-10-11T00:20Z',
                                content: 'Game time !!'
                            },
                            {
                                index: 3,
                                prio: 0,
                                datetime: '2014-11-23T18:00Z',
                                content: 'Dinner with Luey'
                            },
                            {
                                index: 4,
                                prio: 1,
                                datetime: '2015-10-13T10:22Z',
                                content: 'Read the book'
                            },
                            {
                                index: 5,
                                prio: 0,
                                datetime: '2015-10-13T10:22Z',
                                content: 'Business Conferrence in Spain'
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
                                datetime: '2015-10-13T10:22Z',
                                content: 'Go fishing with uncle Hank'
                            },
                            {
                                index: 1,
                                prio: 1,
                                datetime: '2014-10-13T17:00Z',
                                content: 'Family time'
                            },
                            {
                                index: 2,
                                prio: 0,
                                datetime: '2099-11-13T20:00Z',
                                content: 'Too old to do anything'
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
                            content: 'Trash 2009-11-11 from family'
                        },
                        {
                            index: 1,
                            list: 'work',
                            prio: 1,
                            datetime: '2009-11-13T20:00Z',
                            content: 'Another trash from work'
                        },
                        {
                            index: 2,
                            list: 'deleted lists',
                            prio: 0,
                            datetime: '2009-11-13T20:00Z',
                            content: 'my list is deleted :('
                        }
                    ]
                }
            };
            this.save();
        }

    });

    return DataSource;

})();




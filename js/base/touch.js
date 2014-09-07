/*
 * The module that handles all user interactions
 * exposes one variable: isDown (used by ccwx.Collection to determine when to quit animation loop)
 *
 * I DO NOT modify this file much. 
 * This ccwx.touch listens to all touch event on the body, 
 * then detects all kinds of actions and corresponding targets, 
 * finally invokes onXXX methods of target.
 * 
 * I DO NOT know if it's better to listen to touch event in each view.
 */

ccwx.touch = (function () {

    // TouchData object that represents an active touch
    var TouchData = function (e) {

        this.id = e.identifier || 'mouse';

        // starting and current x, y
        this.ox = this.cx = e.pageX;
        this.oy = this.cy = e.pageY;

        // delta x, y
        this.dx = this.dy = 0;

        // total distance x, y
        this.tdx = this.tdy = 0;

        // starting and current time
        this.ot = this.ct = Date.now();

        // delta time
        this.dt = 0;

        // target item
        var targetItemNode = getParentItem(e.target);
        if (targetItemNode) {
            this.targetItem = ccwx.collection.getViewById(targetItemNode.dataset.id);
        }

        // whether the touch has moved
        this.moved = false;

    };

    TouchData.prototype.update = function (e) {

        this.moved = true;

        this.dx = e.pageX - this.cx;
        this.cx = e.pageX;

        this.dy = e.pageY - this.cy;
        this.cy = e.pageY;

        this.tdx = this.cx - this.ox;
        this.tdy = this.cy - this.oy;

        var now = Date.now();
        this.dt = now - this.ct;
        this.ct = now;

    };

    // the array that holds TouchData objects
    var touches     = [];

    // current gesture
    var currentAction;

    // whether it's a touch device
    var t           = ccwx.client.isTouch;

    // shorthand for event types
    var start       = t ? 'touchstart' : 'mousedown',
        move        = t ? 'touchmove' : 'mousemove',
        end         = t ? 'touchend' : 'mouseup';

    // threshold to trigger dragging
    var dragThreshold = 20;

    var s = 0;

    var isSortable = true;

    // init events
    function initEvents () {

        ccwx.$wrapper.off();

        ccwx.$wrapper
            .on(start, function (e) {

                console.log('touchstart');

                // only record one finger
                // and ignore additional fingers if already in action
                if (touches.length >= 1 || currentAction) return;

                pub.isDown = true;

                e = t ? e.changedTouches[0] : e;

                // create touch data
                var touch = new TouchData(e);

                if (ccwx.touch.pinItemView && touch.targetItem !== ccwx.touch.pinItemView) {
                    actions.itemBlur.trigger(e);
                }

                if (ccwx.touch.isEditing || ccwx.touch.pinItemView) return;

                // touches.push(touch);
                touches[0] = touch;
                
                // process actions ======================================================

                if (touches.length === 1 && touches[0].targetItem) {
                    isSortable && actions.itemSort.startTimeout();
                    actions.itemTap.startTimeout();
                }

            })
            .on(move, function (e) {

                console.log('touchmove');

                if (ccwx.touch.isEditing || ccwx.touch.pinItemView) return;

                // for mousemove
                if (!touches.length) return;

                e = t ? e.changedTouches[0] : e;

                // update touch data
                var i = getTouchIndex(e.identifier || 'mouse');
                if (i !== -1) {
                    touches[i].update(e);
                } else {
                    return; // ignore touches not in list
                }

                console.log(Math.pow(touches[0].tdx, 2) + Math.pow(touches[0].tdy, 2));

                if (Math.pow(touches[0].tdx, 2) + Math.pow(touches[0].tdy, 2) > 10) {
                    isSortable && actions.itemSort.cancelTimeout();
                    actions.itemTap.cancelTimeout();
                }
                
                if (!currentAction) {
                    if (touches.length === 1) {
                        actions.collectionDrag.check();
                        actions.itemDrag.check();
                    } 
                } else {
                    // passing in i to let pinch move handler know which finger is which
                    actions[currentAction].move(i);
                }
                
            })
            .on(end, function (e) {

                console.log('touchend');

                if (ccwx.touch.isEditing || ccwx.touch.pinItemView) {
                    touches = [];
                    return;
                }

                e = t ? e.changedTouches[0] : e;
                var id = e.identifier || 'mouse';
                var i = getTouchIndex(id);

                // ignore touches not in list
                if (i === -1) {
                    touches = [];
                    return;
                }

                // isDown
                if (touches.length === 1) {
                    pub.isDown = false;
                }

                // process actions ======================================================

                isSortable && actions.itemSort.cancelTimeout();
                if (actions.itemTap.timeOut != null) {
                    actions.itemTap.cancelTimeout();
                    if (!currentAction && Math.pow(touches[0].tdx, 2) + Math.pow(touches[0].tdy, 2) < 10) {
                        actions.itemTap.trigger(e);
                        touches = [];                    
                        return;
                    }
                }
                

                if (!currentAction) {
                    if (touches[0] && !touches[0].moved && !ccwx.collection.inMomentum) {
                        if (touches[0].targetItem) {
                        } else {
                            actions.collectionTap.trigger(e);
                        }
                    }
                } else {
                    actions[currentAction].end();
                    if (touches.length === 1) {
                        currentAction = null; // reset if it's the last finger
                    }
                }

                touches = [];
                
            });

    }

    var actions = {

        collectionDrag: {

            check: function () {
                if (Math.abs(touches[0].tdy) > dragThreshold) {
                    currentAction = 'collectionDrag';
                    ccwx.collection._onDragStart();
                }
            },

            move: function () {
                ccwx.collection._onDragMove(touches[0].dy);
            },

            end: function () {
                var speed = touches[0].dy / touches[0].dt;
                ccwx.collection._onDragEnd(speed);
            }

        },

        itemDrag: {

            check: function () {
                if (touches[0].targetItem && Math.abs(touches[0].tdx) > dragThreshold) {
                    currentAction = 'itemDrag';
                    touches[0].targetItem._onDragStart();
                }
            },

            move: function () {
                touches[0].targetItem._onDragMove(touches[0].dx);
            },

            end: function () {
                touches[0].targetItem._onDragEnd();
            }

        },

        itemSort: {

            timeOut: null,

            delay: 500,

            startTimeout: function () {
                if (this.timeOut) return;
                this.timeOut = setTimeout(function () {
                    actions.itemSort.trigger();
                }, this.delay);
            },

            move: function () {
                touches[0].targetItem._onSortMove(touches[0].dy);
            },

            end: function () {
                this.cancelTimeout();
                touches[0].targetItem._onSortEnd();
            },

            trigger: function () {
                this.timeOut = null;
                if (currentAction) return;
                if (Math.pow(touches[0].tdx, 2) + Math.pow(touches[0].tdy, 2) < 10) {
                    currentAction = 'itemSort';
                    touches[0].targetItem._onSortStart(); 
                }
            },

            cancelTimeout: function () {
                if (this.timeOut) {
                    clearTimeout(this.timeOut);
                    this.timeOut = null;
                }
            }

        },

        itemTap: {

            timeOut: null,

            delay: 200,

            startTimeout: function () {
                if (this.timeOut) return;
                this.timeOut = setTimeout(function () {
                    this.timeOut = null;
                }, this.delay);
            },

            trigger: function (e) {
                touches[0].targetItem._onTap(e);
            },

            cancelTimeout: function () {
                if (this.timeOut) {
                    clearTimeout(this.timeOut);
                    this.timeOut = null;
                }
            }

        },

        itemBlur: {
            trigger: function (e) {
                ccwx.touch.pinItemView._onBlur(e);
            }
        },

        collectionTap: {

            trigger: function (e) {
                ccwx.collection._onTap(e);
            }

        }

    }

    function getTouchIndex (id) {

        var i = touches.length,
            t;
        while (i--) {
            t = touches[i];
            if (t.id === id) return i;
        }

        return -1;
        
    }

    // check if a node is within a .item element
    function getParentItem (node) {

        while (node && node.classList) { // loop until we reach top of document
            if (node.classList.contains('card-wrapper')) {
                //found one!
                return node;
            }
            node = node.parentNode;
        }

        return null;

    }

    // the public interface
    var pub = {

        init: function () {

            // prevent page dragging
            $(document.body).on('touchmove', function (e) {
                e.preventDefault();
            });

            // Fix for mouseout on desktop
            if (!t) {
                ccwx.$wrapper.on('mouseout', function (e) {

                    var x = e.pageX,
                        y = e.pageY,
                        c = ccwx.client;

                    if (x <= c.left ||
                        x >= c.right ||
                        y <= c.top ||
                        y >= c.bottom) {

                        ccwx.$wrapper.trigger(end);

                    }

                });
            }

            initEvents();

        },

        clear: function () {
            currentAction = undefined;
            s = 0;
            touches = [];
            isSortable = true;
            actions.itemTap.cancelTimeout();
            actions.itemSort.cancelTimeout();
            this.isEditing = false;
            this.pinItemView = null;
        },

        setSortable: function (enable) {
            isSortable = enable;
        },

        isEditing : false,

        pinItemView : null

    };

    return pub;

}());
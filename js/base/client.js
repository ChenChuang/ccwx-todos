/*
 * no work on this file
 */

ccwx.client = (function () {

    var client = {

        isTouch: ('ontouchstart' in window),

        init: function () {

            if (!this.isTouch) {

                this.width = 320;
                this.height = 548;
                $(document.body).addClass('desktop');

            }

            this.update();
            $(window).resize(function () {
                ccwx.client.update();
            });

            // compatibility
            // only supports browsers with CSS 3D Transforms
            // Chrome, FF, IE10+

            var s = document.body.style;

            ccwx.client.isWebkit = 'webkitTransform' in s;
            
            ccwx.client.transformProperty =
                'webkitTransform' in s ? 'webkitTransform' :
                'mozTransform' in s ? 'mozTransform' :
                'msTransform' in s ? 'msTransform' : 'transform';

            var t = ccwx.client.transformProperty;

            ccwx.client.transitionEndEvent =
                t === 'webkitTransform' ? 'webkitTransitionEnd' : 'transitionend';
                //t = 'transitionend';
        },

        update: function () {

            if (this.isTouch) {

                this.width = window.innerWidth,
                this.height = window.innerHeight;

            } else {

                var wrapper = ccwx.$wrapper[0];
                this.top = wrapper.offsetTop;
                this.left = wrapper.offsetLeft;
                this.right = this.left + this.width;
                this.bottom = this.top + this.height;

            }

        }

    };

    return client;

}());
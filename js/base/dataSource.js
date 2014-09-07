/*
 * ccwx.DataSource could be any object provide `load` and `save` function
 * here we use localStorage to store our data, but you can easily move to others.
 */

ccwx.DataSource = (function () {

    var supported = ('localStorage' in window) && ('JSON' in window);
    

    var DataSource = function (options) {
        this.localStorageKey = options.localStorageKey || 'ccwx';
    }

    DataSource.prototype = {

        load: function (force) {

            this.data = null;

            if (supported && !force) {
                var raw = localStorage.getItem(this.localStorageKey);
                if (raw) {
                    this.data = JSON.parse(raw);
                } 
            } 

            if (!this.data) {
                if (this.onReadDataFailed) {
                    this.onReadDataFailed();
                }
            }
            
            if (this.onLoaded) {
                this.onLoaded();
            }

            return this;
        },

        save: function () {

            if (!supported) {
                return false;
            }
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.data));

            if (this.onSaved) {
                return this.onSaved();
            }
        }

    };

    return DataSource;

})();
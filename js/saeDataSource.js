/*
 * ccwx.DataSource could be any object provide `load` and `save` function
 * here we use localStorage to store our data, but you can easily move to others.
 */

var SaeDataSource = (function () {

    var DataSource = function () {
        this.localStorageKey = 'ccwx-todo';
    }

    var useLocal = false;

    DataSource.prototype = {

        load: function (callback) {
            this.loadRemote(callback);
            return this;
        },

        loadRemote: function (callback) {
            var xmlhttp = new XMLHttpRequest();
            var _self = this;
            xmlhttp.onreadystatechange = function(){
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
                    //alert(xmlhttp.responseText);
                    var resp = JSON.parse(xmlhttp.responseText);
                    if (resp.userid) {
                        window.userid = resp.userid;
                        $.fn.cookie('todo-userid', window.userid, { expires: 7 }); 
                    } else {

                    }
                    if (resp.data !== "") {
                        _self.data = JSON.parse(resp.data);
                    } else {
                        useLocal && _self.loadLocal();
                    }
                    
                    document.title = window.userid;
                    callback();
                }
            }

            var params = {};
            if (location.search) {
                var parts = location.search.substring(1).split('&');

                for (var i = 0; i < parts.length; i++) {
                    var nv = parts[i].split('=');
                    if (!nv[0]) continue;
                    params[nv[0]] = nv[1] || true;
                }
            }
            var code = params.code;
            window.params = params;
            window.userid = $.fn.cookie('todo-userid') || undefined;
            
            if (window.userid) {
                xmlhttp.open("GET", "http://ccqywx.sinaapp.com/todoapi?userid=" + window.userid, true);
            } else {
                xmlhttp.open("GET", "http://ccqywx.sinaapp.com/todoapi?agent=todo&code=" + code, true);
            }
            
            xmlhttp.send();
        },

        loadLocal: function () {

            this.data = null;

            var raw = localStorage.getItem(this.localStorageKey);
            if (raw) {
                this.data = JSON.parse(raw);
            }

            if (!this.data) {
                this.data = {
                    timestamp: 0,
                    lists: [
                        {
                            title: 'work',
                            index: 0,
                            items: []
                        },
                        {
                            title: 'family',
                            index: 1,
                            items: []
                        }
                    ],
                    trash: {
                        items: []
                    }
                };
                this.saveLocal();
            }

            return this;
        },

        saveLocal: function () {

            localStorage.setItem(this.localStorageKey, JSON.stringify(this.data));

            if (this.onSaved) {
                return this.onSaved();
            }
        }, 

        saveRemote: function () {
            $.ajax({
                type: 'POST',
                url: 'http://ccqywx.sinaapp.com/todoapi?userid=' + window.userid,
                data: JSON.stringify(this.data),
                contentType: 'application/json',
                success: function (response) {
                    //alert(response);
                }
            });
        },

        save: function () {
            useLocal && this.saveLocal();
            this.saveRemote();
        }

    };

    return DataSource;

})();
// https://github.com/chemhack/libSBGN.js/blob/master/src/io/jsonp.js

/**
 * Class for cross-domain jsonp requests.
 * @param {string} url
 * @param {Object} params
 * @param {Function} callback
 * @constructor
 * @export
 */
Jsonp = function (url, params, callback) {
    this.url = url;
    this.callback = callback;
    this.internalCallback = this.generateCallback();
    // Drop the script on the page
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    var query = '';
    params = params || {};
    var key;
    for (key in params) {
        if (params.hasOwnProperty(key)) {
            query += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
        }
    }
    script.setAttribute('src', url + '?' + query + 'callback=Jsonp.' + this.internalCallback);
    this.script = document.getElementsByTagName('head')[0].appendChild(script);
};

/**
 * Fire a jsonp request
 * @param {string} url
 * @param {Object} params
 * @param {Function} callback
 * @export
 */
Jsonp.call=function(url,params,callback){
   new Jsonp(url,params,callback);
};

Jsonp.prototype.generateCallback = function () {
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var randomName = '';

    for (var i = 0; i < 15; i++) {
        randomName += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    var self = this;

    Jsonp[randomName] = function (data) {
        self.callback(data);

        // Cleanup
        delete Jsonp[randomName];
        self.script.parentNode.removeChild(self.script);
    };
    return randomName;
};


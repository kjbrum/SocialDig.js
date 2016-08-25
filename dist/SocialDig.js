/**
 *
 *  -----------------------------------
 *  SocialDig.js - v0.1.1
 *  -----------------------------------
 *
 *  Query data from your social profiles with ease.
 *
 *  https://github.com/kjbrum/SocialDig.js
 *  @license Copyright (c) Kyle Brumm <http://kylebrumm.com>
 *
 */

;
(function(global) {
    var SocialDig = function(settings, cb) {
        return new SocialDig.init(settings, cb);
    }

    SocialDig.prototype = {
        /************************************
         * Handle caching the returned data *
         ************************************/
        checkCache: function() {
            var self = this;

            var now = new Date().getTime();
            var foundCache = false;
            var cache = JSON.parse(localStorage.getItem(self.service));

            if (cache) {
                if ((now - cache.time) < (self.cacheLimit * 60000)) {
                    self.data = cache.data;
                    foundCache = true;
                } else {
                    localStorage.removeItem(self.service);
                }
            }

            return foundCache;
        },

        /**********************************
         *  Handle our special JSONP APIs *
         **********************************/
        JSONP: function(cb) {
            var self = this;
            var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            window[callbackName] = function(data) {
                self.data = data;

                // Save the new data to localStorage
                self.cacheData();

                // Cleanup
                delete window[callbackName];
                document.body.removeChild(script);

                // Run our callback function
                cb(self.data);
            };

            var script = document.createElement('script');
            script.src = self.url + (self.url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
            document.body.appendChild(script);
        },

        /**********************************************
         * Make our HTTP request to get the JSON data *
         **********************************************/
        makeRequest: function(cb) {
            var self = this;
            var request = new XMLHttpRequest();
            request.open('GET', self.url, true);

            // Enable additional headers
            var headers = ['dribbble', 'spotify', 'vimeo'];
            if (headers.indexOf(self.service) > -1) {
                request.setRequestHeader('Authorization', 'Bearer ' + self.auth);
            }

            // Check for a successful response
            request.onload = function() {
                // Parse the response
                var data = JSON.parse(request.responseText);
                self.data = data;


                // Check the status of the request
                var status = data.code || request.status;
                if (status >= 200 && status < 400) {
                    // Save the new data to localStorage
                    self.cacheData();

                    // Run our callback function
                    cb(self.data);
                } else {
                    // Error from the server
                    throw self.data.message;
                }
            };

            // Handle any errors
            request.onerror = function() {
                // Connection error
                throw 'connection error';
            };

            // Send the request
            request.send();
        },

        /*********************************************
         * Query the data from the necessary service *
         *********************************************/
        queryData: function() {
            var self = this;
            var container = self.selector;

            // Check the type of selector that was supplied
            if (typeof self.selector === 'string') {
                container = document.querySelector(self.selector);
            }

            // Check for cached data
            if (self.checkCache()) {
                // Return the cached data
                self.cb(self.data);
            } else {
                // Make the API request
                var special = ['instagram', 'behance', 'tumblr'];
                if (special.indexOf(self.service) > -1) {
                    self.JSONP(self.cb);
                } else {
                    self.makeRequest(self.cb);
                }
            }
        },

        /*************************************
         * Save our new data to localStorage *
         *************************************/
        cacheData: function() {
            var self = this;
            var now = new Date().getTime();
            var newCacheData = JSON.stringify({
                time: now,
                data: self.data
            });

            // Save new data into localStorage
            localStorage.setItem(self.service, newCacheData);
        }
    };

    /******************************
     *  Initializing our function *
     ******************************/
    SocialDig.init = function(settings, cb) {
        var self = this;

        // Setup settings
        self.selector = settings.selector || '.social-dig'; // Selector for the container
        self.service = settings.service || ''; // Service
        self.user = settings.user || ''; // Service user (username/id/etc...)
        self.auth = settings.auth || ''; // Service authorization token/key

        // Number of minutes to cache results
        if (settings.cacheLimit == null) {
            self.cacheLimit = 5;
        } else {
            self.cacheLimit = settings.cacheLimit;
        }

        // Add all the available services
        self.services = {
            '500px': 'https://api.500px.com/v1/photos?consumer_key=' + self.auth + '&feature=user&username=' + self.user + '&image_size=440',
            'behance': 'http://www.behance.net/v2/users/' + self.user + '/projects?client_id=' + self.auth,
            'codepen': 'http://cpv2api.com/pens/public/' + self.user,
            'dribbble': 'https://api.dribbble.com/v1/users/' + self.user + '/shots',
            'flickr': 'https://api.flickr.com/services/rest/?method=flickr.people.getPhotos&api_key=' + self.auth + '&user_id=' + self.user + '&format=json&nojsoncallback=1',
            'github': 'https://api.github.com/users/' + self.user + '/repos?sort=updated',
            'google-plus': 'https://www.googleapis.com/plus/v1/people/' + self.user + '/activities/public?key=' + self.auth,
            'instagram': 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + self.auth,
            'lastfm': 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + self.user + '&api_key=' + self.auth + '&format=json',
            'pinterest': 'https://api.pinterest.com/v1/me/boards/?access_token=' + self.auth + '&fields=id,name,url,created_at,counts,description,creator,image,privacy,reason',
            'spotify': 'https://api.spotify.com/v1/users/' + self.user + '/playlists',
            'trello': 'https://api.trello.com/1/members/' + self.user + '/boards',
            'tumblr': 'https://api.tumblr.com/v2/blog/' + self.user + '.tumblr.com/posts?api_key=' + self.auth,
            'twitter': 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=' + self.user,
            'vimeo': 'https://api.vimeo.com/users/' + self.user + '/videos'
        };

        self.url = self.services[self.service]; // Service API URL
        self.data = ''; // Service data from server
        self.cb = cb; // Service callback

        // Query the data
        self.queryData();
    };

    SocialDig.init.prototype = SocialDig.prototype;
    global.SocialDig = global.SD = SocialDig;
}(window));

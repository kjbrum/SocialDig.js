/**
 *
 *  -----------------------------------
 *  SocialDig.js - v0.1.0
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

            // Build the request URL
            switch (self.service) {
                case '500px':
                    self.url = 'https://api.500px.com/v1/photos?consumer_key=' + self.auth + '&feature=user&username=' + self.user + '&image_size=440';
                    break;
                case 'behance':
                    self.url = 'http://www.behance.net/v2/users/' + self.user + '/projects?client_id=' + self.auth;
                    break;
                case 'codepen':
                    self.url = 'http://cpv2api.com/pens/public/' + self.user;
                    break;
                case 'dribbble':
                    self.url = 'https://api.dribbble.com/v1/users/' + self.user + '/shots';
                    break;
                case 'flickr':
                    self.url = 'https://api.flickr.com/services/rest/?method=flickr.people.getPhotos&api_key=' + self.auth + '&user_id=' + self.user + '&format=json&nojsoncallback=1';
                    break;
                case 'github':
                    self.url = 'https://api.github.com/users/' + self.user + '/repos?sort=updated';
                    break;
                case 'google-plus':
                    self.url = 'https://www.googleapis.com/plus/v1/people/' + self.user + '/activities/public?key=' + self.auth;
                    break;
                case 'instagram':
                    self.url = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + self.auth;
                    break;
                case 'lastfm':
                    self.url = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + self.user + '&api_key=' + self.auth + '&format=json';
                    break;
                case 'pinterest':
                    self.url = 'https://api.pinterest.com/v1/me/boards/?access_token=' + self.auth + '&fields=id,name,url,created_at,counts,description,creator,image,privacy,reason';
                    break;
                case 'spotify':
                    self.url = 'https://api.spotify.com/v1/users/' + self.user + '/playlists';
                    break;
                case 'trello':
                    self.url = 'https://api.trello.com/1/members/' + self.user  + '/boards';
                    break;
                // case 'twitter':
                //     self.url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=' + self.user;
                //     break;
                case 'vimeo':
                    self.url = 'https://api.vimeo.com/users/' + self.user + '/videos';
                    break;
            }

            // Make the API request
            var special = ['instagram', 'behance'];
            if (special.indexOf(self.service) > -1) {
                self.JSONP(self.cb);
            } else {
                self.makeRequest(self.cb);
            }
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
                if (request.status >= 200 && request.status < 400) {
                    // Return the found data
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

        /**********************************
         *  Handle our special JSONP APIs *
         **********************************/
        JSONP: function(cb) {
            var self = this;
            var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            window[callbackName] = function(data) {
                self.data = data;
                delete window[callbackName];
                document.body.removeChild(script);
                cb(self.data);
            };

            var script = document.createElement('script');
            script.src = self.url + (self.url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
            document.body.appendChild(script);
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
        self.url = ''; // Service API URL
        self.data = ''; // Service data from server
        self.cb = cb; // Service callback

        // Query the data
        self.queryData();
    };

    SocialDig.init.prototype = SocialDig.prototype;
    global.SocialDig = global.SD = SocialDig;
}(window));

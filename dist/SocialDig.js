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
            }


            // Make the API request
            var special = ['instagram', 'behance'];
            if (special.indexOf(self.service) > -1) {
                self.JSONP(self.url).then(function(data){
                    self.data = data;
                    self.cb(self.data);
                });
            } else {
                var request = new XMLHttpRequest();
                request.open('GET', self.url, true);

                // Enable additional headers
                var headers = ['dribbble', 'spotify'];
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
                        self.cb(self.data);
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
            }
        },

        /**********************
         *  Handle JSONP APIs *
         **********************/
        JSONP: function(url) {
            return new Promise(function(resolve, reject){
                var id = '_' + Math.round(10000 * Math.random());
                var callbackName = 'jsonp_callback_' + id;
                window[callbackName] = function(data){
                    delete window[callbackName];
                    var ele = document.getElementById(id);
                    ele.parentNode.removeChild(ele);
                    resolve(data);
                }

                var src = url + '&callback=' + callbackName;
                var script = document.createElement('script');
                script.src = src;
                script.id = id;
                script.addEventListener('error', reject);
                (document.getElementsByTagName('head')[0] || document.body || document.documentElement).appendChild(script);
            })
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

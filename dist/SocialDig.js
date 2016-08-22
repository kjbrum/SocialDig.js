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
    var SocialDig = function(settings, callback) {
        return new SocialDig.init(settings, callback);
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
                    self.url = 'https://api.500px.com/v1/photos?consumer_key=' + self.auth + '&feature=user&username=' + self.username + '&image_size=440';
                    break;
                case 'codepen':
                    self.url = 'http://cpv2api.com/pens/public/' + self.username;
                    break;
                case 'dribbble':
                    self.url = 'https://api.dribbble.com/v1/users/' + self.username + '/shots';
                    break;
                case 'github':
                    self.url = 'https://api.github.com/users/' + self.username + '/repos?sort=updated';
                    break;
                case 'instagram':
                    self.url = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + self.auth + '&callback=specialAPI';
                    break;
                case 'pinterest':
                    self.url = 'https://api.pinterest.com/v1/me/boards/?access_token=' + self.auth + '&fields=id,name,url,created_at,counts,description,creator,image,privacy,reason';
                    break;
                case 'trello':
                    self.url = 'https://api.trello.com/1/members/' + self.username  + '/boards';
                    break;
            }


            // Make the API request
            if (self.service == 'instagram') {
                var script = document.createElement('script');
                script.src = self.url

                document.getElementsByTagName('head')[0].appendChild(script);
            } else {
                var request = new XMLHttpRequest();
                request.open('GET', self.url, true);

                // Enable additional headers
                if (self.service == 'dribbble') {
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
                        self.callback(self.data);
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
        }
    };

    /*************************************
     *  Initializing our function *
     *************************************/
    SocialDig.init = function(settings, callback) {
        var self = this;

        // Setup settings
        self.selector = settings.selector || '.social-dig'; // Selector for the container
        self.service = settings.service || ''; // Service
        self.username = settings.username || ''; // Service username
        self.auth = settings.auth || ''; // Service authorization token/key
        self.url = ''; // Service API URL
        self.data = ''; // Service data from server
        self.callback = callback; // Service callback

        // Query the data
        self.queryData();
    }

    SocialDig.transferer = function(data) {
        var self = this;
        callback(data);
    }

    SocialDig.init.prototype = SocialDig.prototype;

    global.SocialDig = global.SD = SocialDig;

    var specialAPI = function(data) {
        SocialDig.transferer(data);
    }
    global.specialAPI = specialAPI;
}(window));

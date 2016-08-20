;
(function(global) {
    // 500px
    ServiceSnatcher({
        selector: '.fivehundredpx',
        service: '500px',
        username: 'kjbrum',
        auth: 'VoO5pDr8HxVQtrDVeQXKqF6Kzx0PJdlvy0mjNEGt'
    }, function(data) {
        if (data.photos.length > 0) {
            var list = document.createElement('div');
            list.className = 'g g-s-2 photos';

            // Loop through the photos
            data.photos.forEach(function(el, idx, arr) {
                if (idx < 4) {
                    var item = document.createElement('div');
                    item.className = 'gi photo';

                    var photoHTML = '<a href="http://500px.com' + el.url + '" target="_blank"><img src="' + el.image_url + '" alt="' + el.name + '" title="' + el.name + '"></a>';
                    item.innerHTML = photoHTML;

                    // Add the new item to the list
                    list.appendChild(item);
                }
            });

            // Add the list to the page
            document.querySelector('.fivehundredpx').appendChild(list);
        }
    });

    // Dribbble
    ServiceSnatcher({
        selector: '.dribbble',
        service: 'dribbble',
        username: 'kjbrum',
        auth: '305b1f7fb8e23dd9375061f6fa5e26263fdfc0ecbfb50f30379b01f98829f259'
    }, function(data) {
        if (data.length > 0) {
            var list = document.createElement('div');
            list.className = 'g g-s-2 shots';

            // Loop through the shots
            data.forEach(function(el, idx, arr) {
                if (idx < 4) {
                    var item = document.createElement('div');
                    item.className = 'gi shot';

                    var shotHTML = '<a href="' + el.html_url + '" target="_blank"><img src="' + el.images.normal + '" alt="' + el.title + '" title="' + el.title + '"></a>';
                    item.innerHTML = shotHTML;

                    // Add the new item to the list
                    list.appendChild(item);
                }
            });

            // Add the list to the page
            document.querySelector('.dribbble').appendChild(list);
        }
    });

    // Instagram
    // ServiceSnatcher({
    //     service: 'instagram',
    //     username: 'kjbrum',
    //     auth: '175436735.49954d7.8ed44a3a4d8c49dd97c4219656c04e29'
    // }, function(data) {
    //     console.log(data);
    // });
})(window);

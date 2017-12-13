var model = [
    // Array of location objects.
    {
        name: "Brooklyn College",
        coordinates: {
            lat:  40.640767,
            lng:  -73.952736
        },
        address: "2900 Bedford Ave,Brooklyn, NY, 11210",
        id:"l3mZ1tEwRVDguq02Q"
    },

    {
        name: "Peter Luger Steak House",
        coordinates: {
            lat:  40.7107764,
            lng: -73.9641866
        },
        address: "178 Broadway, Brooklyn, NY 11211",
        id:"xUOxfgLIfXlir9dPe8"
    },

    {
        name: "Brooklyn Botanical Garden",
        coordinates: {
            lat:  40.6677184,
            lng: -73.9633417
        },
        address: "990 Washington Ave, Brooklyn, NY 11225",
        id:"26Ff03X5unJUlh2CY"
    },

    {
        name: "Pratt Institute Brooklyn",
        coordinates: {
            lat:  40.6912936,
            lng: -73.9627171
        },
        address: "200 Willoughby Ave, Brooklyn, NY 11205",
        id: "xT0xexwLDQWFnBYJeo"
    },

    {
        name: "Brooklyn Children Museum",
        coordinates: {
            lat:  40.674758,
            lng: -73.940851
        },
        address: "145 Brooklyn Ave, Brooklyn, NY 11213",
        id:"l1Kdbo0aslN0Z6hCE"
    }
];



function ViewModel() {
    
    var self = this;

    self.listItem = ko.observableArray();

    self.clickedMarker = ko.observable();

    // Changes affect the image element/
    self.gif = ko.observable();

    // Pushes markers into observable array.
    for (var i = 0; i < model.length; i++) {

        self.listItem.push(model[i].marker);
    }

    // Matches list item innerHTML to marker title then sets
    // clickedMarker to that marker and calls the bounce function and displays infoWindow.
    self.checkMarker = function() {

        var listText = event.target.innerHTML;

        for (var i = 0; i < model.length; i++) {

            if (listText === model[i].marker.title) {

                self.clickedMarker(model[i].marker);
                
                initMap.bounce();

                model[i].infowindow.open(map, model[i].marker);

                self.displayGif(model[i].id);
            }
        }
    };

    // Changes affect input element.
    self.filter = ko.observable('');

    self.checkSearch = function() {

        for (var i = 0; i < model.length; i++) {

            if (model[i].marker.title.toLowerCase().indexOf(self.filter().toLowerCase()) < 0) {

                model[i].marker.visibleState(false);

                model[i].marker.setVisible(false);

                model[i].infowindow.close();

            } else {

                model[i].marker.visibleState(true);

                model[i].marker.setVisible(true);
            }
        }
    };

    // HTTP request to api.
    self.displayGif = function(gifID) {
        
        var apiKey = '?api_key=dc6zaTOxFJmzC&limit';
        var url = 'https://api.giphy.com/v1/gifs/' + gifID + apiKey;
        var gifByID = new XMLHttpRequest();

        gifByID.open("GET", url, true);
    
        gifByID.send();

        gifByID.onload = function() {

            // If no errors, set image element src to api url.
            if (gifByID.status === 200) {

                console.log(JSON.parse(gifByID.response));
                
                self.gif(JSON.parse(gifByID.response).data.images.downsized.url);

            // Set image element scr to error message image.
            } else if (gifByID.status != 200) {
                
                self.gif("images/error.png");
            }
        };

        gifByID.onerror = function() {

            alert("Something went wrong with Giphy. Please try again later.");

            self.gif("images/error.png");
        };
    };
}

function initMap() {

    var map = new google.maps.Map(document.getElementById('map'), {
        
        // Sets the zoom when page loads.
        zoom: 12,

        // Position where the map centers on.
        center: model[0].coordinates,

        // Moved map items to bottom right.
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
        },

        fullscreenControl: true,
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },

        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        }
    });

    // Creates markers and infoWindows.
    var placeMarkerAndInfoWindow = function(i) {
        
        // Creates a new marker
        var marker = new google.maps.Marker({

            // Coordinates to place marker.
            position: model[i].coordinates,

            // Which map to place markers on.
            map: map,

            // On hover displays conent.
            title: model[i].name,

            // Animation that drops from above on to map.
            animation: google.maps.Animation.DROP,

            // List item displays when true
            visibleState: ko.observable(true),
        });

        // Creates a new infowindow.
        var infowindow = new google.maps.InfoWindow({

            content: model[i].address
        });

        // Listens for clicks on marker to show content in infoWindow.
        marker.addListener('click', function() {
            model[i].infowindow.open(map, marker);
        });

        // Once clicked, stores the scope so it can be used in the bounce function.
        marker.addListener('click', function() {
            clickedMarker(this);
        });

        // Listens for clicks on marker for bounce animation.
        marker.addListener('click', initMap.bounce);

        marker.addListener('click', markerGif);

        // marker.addListener('click', ViewModel.checkMarker);

        // Adds a marker to the model.
        model[i].marker = marker;

        // Adds a infoWindow to the model.
        model[i].infowindow = infowindow;
    };

    initMap.bounce = function() {

        clickedMarker().setAnimation(google.maps.Animation.BOUNCE);

        setTimeout(function() {

            clickedMarker().setAnimation(null);

        }, 700);
    };

    // Places content on map.
    for (var i = 0; i < model.length; i++) {
        placeMarkerAndInfoWindow(i);
    }

    // Activates knockout.js.
    ko.applyBindings(ViewModel);
}

function googleError() {

    alert("Something went wrong with Google Maps. Please try again later.");

}

function markerGif() {
    for (var i = 0; i < model.length; i++) {
        if (clickedMarker().title === model[i].name) {
            displayGif(model[i].id);
        }
    }
}
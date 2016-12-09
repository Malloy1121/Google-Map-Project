var map;
var markers = [];
var placeMarkers=[];
var input = document.getElementById("input");
var dest=document.getElementById("dest");
var staring=document.getElementById("starting");

var styles = [
    {
        featureType: "water",
        stylers: [
            {color: "#0917e5"}
        ]
    },
    {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [
            {color: "#fffa00"},
            {lightness: -30}
        ]
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [
            {color: "#c1be00"},
            {lightness: -35}
        ]
    }
];


function initMap() {
    var locations = [
        {title: 'Shake Shack at Herald Square', location: {lat: 40.7511815, lng: -73.98820379999999}},
        {title: 'Shake Shack at Grand Central Terminal', location: {lat: 40.75255380000001, lng: -73.97862789999999}},
        {
            title: 'Shake Shack at Asphalt Green Battery Park City Campus',
            location: {lat: 40.7152344, lng: -74.01490389999999}
        },
        {title: 'Shake Shack at American Museum of Natural History', location: {lat: 40.7808555, lng: -73.97654}},
        {title: 'Shake Shack at The Fulton Center', location: {lat: 40.7104473, lng: -74.00891709999999}},
    ];
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 11,
        styles: styles,
        mapTypeControl: false
    });


    var infoWin = new google.maps.InfoWindow();



    var service = new google.maps.places.AutocompleteService();

    input.addEventListener("keyup", function () {
        vm.toStarting(false);
        if (this.value.length > 0)
            getPredictions(this.value, this);
        else
            vm.setPredictions();
    });

    dest.addEventListener("keyup", function () {
        vm.toStarting(false);
        if (this.value.length > 0)
            getPredictions(this.value, this);
        else
            vm.setPredictions();
    });

    staring.addEventListener("keyup", function () {
        vm.toStarting(true);
        if (this.value.length > 0)
            getPredictions(this.value, this);
        else
            vm.setPredictions();
    });

    function getPredictions(input, target) {
        service.getQueryPredictions({input: input}, getAutoPlaces);

        function getAutoPlaces(predications, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                vm.setPredictions(predications);
            }
            else {
                vm.setPredictions();
                console.log("Request Failed!");
            }
        }
    }





    function makeMarkerIcon(icon) {
        var markerImage = new google.maps.MarkerImage(
            icon,
            new google.maps.Size(32, 32),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(32, 32));
        return markerImage;
    }

    function showMarkers() {
        locations.forEach(function (location) {
            var position = location.location;
            var title = location.title;
            var marker = new google.maps.Marker({
                position: position,
                map: map,
                title: title,
                animation: google.maps.Animation.DROP
            });

            markers.push(marker);
            marker.addListener("click", function () {
                //map.setCenter(new google.maps.LatLng({lat:this.position.lat(),lng:this.position.lng()}))
                map.panTo(this.position);
                //marker.setIcon(makeMarkerIcon("http://maps.google.com/mapfiles/kml/paddle/red-circle-lv.png"));
                addInfoWin(this, map);
            })
        })
    }

    showMarkers();

    function hideMarkers(array) {
        array.forEach(function (each) {
            each.map = null;
        })
    }

    function addInfoWin(marker, map) {

        if (infoWin.marker == marker) {
            return;
        }
        infoWin.setContent("");
        infoWin.marker = marker;


        infoWin.addListener("closeclick", function () {
            infoWin.marker = null;
            //marker.setIcon();
        })

        var streetViewService = new google.maps.StreetViewService();

        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var svLocation = data.location.latLng;
                infoWin.setContent('<div id="info_title">' + marker.title + '</div><div id="pano"></div>');
                var heading = google.maps.geometry.spherical.computeHeading(svLocation, marker.position);
                var panoramaOptions = {
                    position: svLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                }
                var panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"), panoramaOptions);
            }
            else {
                infoWin.setContent('<div id="info_title">' + marker.title + '</div><div id="pano">No Street View Found!</div>');
            }

        }

        streetViewService.getPanoramaByLocation(marker.position, 100, getStreetView);
        infoWin.open(map, marker);
    }


}
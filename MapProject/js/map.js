var map;
var markers = [];
var placeMarkers=[];
var input = document.getElementById("input");
var dest=document.getElementById("dest");
var staring=document.getElementById("starting");
var search=document.getElementById("search");
var info_win=document.getElementById("info_win");
var routes=document.getElementById("routes");
var info_win_HTML='<div id="info_title"></div><div id="street_view"></div>';
var infoWin;
var geocoder;
var service;
var trafficLayer;
var directionsService;
var directionsRenderer;
var streetViewService;
var placesService;

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



    infoWin = new google.maps.InfoWindow();
    geocoder=new google.maps.Geocoder();
    service = new google.maps.places.AutocompleteService();
    trafficLayer = new google.maps.TrafficLayer();
    streetViewService = new google.maps.StreetViewService();
    //trafficLayer.setMap(map);
    directionsService = new google.maps.DirectionsService;
    directionsRenderer = new google.maps.DirectionsRenderer;
    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(routes);
    placesService=new google.maps.places.PlacesService(map);


    input.addEventListener("keyup", function () {
        // vm.toStarting(false);
        if (this.value!=""&&this.value.length > 0) {
            getPredictions(this.value, this);
        }
        else
            vm.setPredictions(null);
    });


    dest.addEventListener("keyup", function () {
        // vm.toStarting(false);
        vm.isShowPredictions(true);
        vm.isDestReady(false);
        if (this.value.length > 0)
            getPredictions(this.value, this);
        else
            vm.setPredictions(null);
    });

    dest.addEventListener("click", function () {
        vm.toStarting(false);
        vm.isShowPredictions(!vm.isShowPredictions());
        if (this.value.length > 0)
            getPredictions(this.value, this);
        else
            vm.setPredictions(null);
    });

    staring.addEventListener("keyup", function () {
        // vm.toStarting(true);
        vm.isStartingReady(false);
        vm.isShowPredictions(true);
        if (this.value.length > 0)
            getPredictions(this.value, this);
        else
            vm.setPredictions(null);
    });

    staring.addEventListener("click", function () {
        vm.toStarting(true);
        vm.isShowPredictions(!vm.isShowPredictions());
        console.log(vm.isShowPredictions());
        if (this.value.length > 0)
            getPredictions(this.value, this);
        else
            vm.setPredictions(null);
    });

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
            var latlng=new google.maps.LatLng(location.location.lat,location.location.lng);

            var position = location.location;
            var title = location.title;
            var marker = new google.maps.Marker({
                position: position,
                map: map,
                title: title,
                animation: google.maps.Animation.DROP
            });

            geocoder.geocode({
                latLng:latlng
            },function (results,status) {
                if(status==google.maps.GeocoderStatus.OK){
                    if(results[1]){
                        // console.log(results[1]);
                        marker.formattedAddress=results[1].formatted_address;
                    }
                    else {
                        console.log("No result found");
                    }
                }
                else {
                    console.log("Geocoder failed due to "+status);
                }

            });


            markers.push(marker);
            marker.addListener("click", function () {
                vm.currentMarker(this);
                map.panTo(this.position);
                if(!vm.isSideBarOpen())
                vm.isNavBackHidden(false);
                vm.searchBtn.flag=false;
                vm.searchBtnIcon(vm.searchBtn.image());
                addInfoWin(this, map);
                vm.isBtnGroupHidden(false);

                // console.log(this.position.lat());
            });
        });
    }

    showMarkers();



    search.addEventListener("click",function () {
        info_win.innerHTML="";
        vm.isInputListClose(true);
        if(input.value==null||input.value=="")
            return;
        vm.isBtnGroupHidden(true);
        vm.isNavBackHidden(true);
        hideMarkers(markers);
        hideMarkers(placeMarkers);
        markers=[];
        placeMarkers=[];
        getPlaces();
        vm.searchBtn.flag=true;
        vm.searchBtnIcon(vm.searchBtn.image());
    });

}
//initMap ends



function hideMarkers(array) {
    array.forEach(function (each) {
        each.setMap(null);
    })
}

function getPredictions(input, target) {
    service.getQueryPredictions({input: input}, getAutoPlaces);

    function getAutoPlaces(predictions, status) {
        if(predictions==null){
            console.log("No location entered.");
            return;
        }
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            vm.setPredictions(predictions);
        }
        else {
            vm.setPredictions();
            console.log("Request failed.");
        }
    }
}

function addInfoWin(marker, map) {
    // var streetViewService = new google.maps.StreetViewService();
    info_win.innerHTML=info_win_HTML;
    var streetView=document.getElementById("street_view");
    if (infoWin.marker == marker) {
        return;
    }

    function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
            var svLocation = data.location.latLng;
            var heading = google.maps.geometry.spherical.computeHeading(svLocation, marker.position);
            var panoramaOptions = {
                position: svLocation,
                pov: {
                    heading: heading,
                    pitch: 30
                }
            }
            document.getElementById("info_title").innerText=marker.title;
            var panorama = new google.maps.StreetViewPanorama(streetView, panoramaOptions);
        }
        else {
            info_win.innerHTML="Street view not found";
        }

    }

    streetViewService.getPanoramaByLocation(marker.position, 100, getStreetView);
}


function getPlaces() {
    // var placesService=new google.maps.places.PlacesService(map);
    placesService.textSearch({
        query:input.value,
        bounds:map.getBounds()
    },function (results,status) {
        if(status==google.maps.places.PlacesServiceStatus.OK){
            // console.log(results);
            createPlacesMarkers(results,true);
        }
    });

}

function getSinglePlace(place) {
    // var placesService=new google.maps.places.PlacesService(map);
    // console.log(place);

    placesService.textSearch({
        query:place,
        bounds:map.getBounds()
    },function (results,status) {
        if(status==google.maps.places.PlacesServiceStatus.OK){
            // console.log(results);
            createPlacesMarkers(results,false);
        }
    });
}

function createPlacesMarkers(places,flag) {
    // console.log(places);
    var bounds=new google.maps.LatLngBounds();
    if(flag) {
        places.forEach(function (each) {
            var marker = new google.maps.Marker({
                map: map,
                title: each.name,
                position: each.geometry.location,
                id: each.place_id,
                formattedAddress: each.formatted_address
            });
            placeMarkers.push(marker);
            marker.addListener("click", function () {
                vm.currentMarker(this);
                map.panTo(this.position);
                if (!vm.isSideBarOpen())
                    vm.isNavBackHidden(false);
                vm.searchBtn.flag = false;
                vm.searchBtnIcon(vm.searchBtn.image());
                addInfoWin(this, map);
                vm.isBtnGroupHidden(false);
                // console.log(this);
            });
            if (each.geometry.viewport) {
                bounds.union(each.geometry.viewport);
            } else {
                bounds.extend(each.geometry.location);
            }
        });
        addInfoWin(placeMarkers[0], map);
        vm.destMarker(placeMarkers[0]);
        vm.isDestReady(true);
        map.fitBounds(bounds);
    }

    else{
        var place=places[0];
        // console.log(place);
        var marker = new google.maps.Marker({
            map: null,
            title: place.name,
            position: place.geometry.location,
            id: place.place_id,
            formattedAddress: place.formatted_address
        });


        marker.addListener("click", function () {
            vm.currentMarker(this);
            map.panTo(this.position);
            if (!vm.isSideBarOpen())
                vm.isNavBackHidden(false);
            vm.searchBtn.flag = false;
            vm.searchBtnIcon(vm.searchBtn.image());
            addInfoWin(this, map);
            vm.isBtnGroupHidden(false);

            // console.log(this);
        });
        addInfoWin(marker, map);
        placeMarkers.push(marker);
        // vm.currentMarker(marker);
        if(vm.toStarting()) {
            vm.startingMarker(marker);
            console.log(vm.startingMarker());
            vm.isStartingReady(true);
            vm.location.starting(vm.startingMarker().formattedAddress);
            vm.showDirection();
            // console.log(vm.startingMarker());
        }
        else {
            vm.destMarker(marker);
            console.log(vm.destMarker());
            vm.isDestReady(true);
            vm.location.destination(vm.destMarker().formattedAddress);
            vm.showDirection();
            // console.log(vm.destMarker());
        }

            // console.log(vm.currentMarker());
        if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }

        if(vm.isDestReady()&&vm.isStartingReady()) {
            // vm.showDirection();
        }
        else {
            marker.setMap(map);
            map.fitBounds(bounds);
        }

        }



}

function getFirstPredictions(input) {
    console.log(input)
    service.getQueryPredictions({input: input}, getAutoPlaces);
    function getAutoPlaces(predictions, status) {
        if(predictions==null){
            console.log("No location entered.");
            return;
        }
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log(predictions)
            vm.firstPrediction(predictions[0].description);

        }
        else {
            console.log("Request failed.");
        }
    }
}

function displayDirections() {
    vm.location.starting(vm.startingMarker().formattedAddress);
    vm.location.destination(vm.destMarker().formattedAddress);
    directionsRenderer.setMap(null);
    directionsService.route({
        origin:vm.startingMarker().formattedAddress,
        destination:vm.destMarker().formattedAddress,
        travelMode:vm.currentMode().mode,
        avoidTolls:vm.isAvoidTolls()
    },function (result,status) {
        // console.log(result);
        if(status==google.maps.DirectionsStatus.OK){
            directionsRenderer.setDirections(result);
            hideMarkers(placeMarkers);
            vm.destMarker().setMap(null);
            vm.startingMarker().setMap(null);
            directionsRenderer.setMap(map);
        }
        else {
            console.log('Directions request failed due to ' + status);
        }
    })
}
var map;
var placeMarkers=[];    //Place markers
var routes=document.getElementById("routes");
var infoWin;
var geocoder;
var service;
var trafficLayer;
var directionsService;
var directionsRenderer;
var streetViewService;
var placesService;


//Customized style object
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

//Initialize Google Maps
function initMap() {
    //Default locations
    // var locations = [
    //     {title: 'Shake Shack at Herald Square', location: {lat: 40.7511815, lng: -73.98820379999999}},
    //     {title: 'Shake Shack at Grand Central Terminal', location: {lat: 40.75255380000001, lng: -73.97862789999999}},
    //     {
    //         title: 'Shake Shack at Asphalt Green Battery Park City Campus',
    //         location: {lat: 40.7152344, lng: -74.01490389999999}
    //     },
    //     {title: 'Shake Shack at American Museum of Natural History', location: {lat: 40.7808555, lng: -73.97654}},
    //     {title: 'Shake Shack at The Fulton Center', location: {lat: 40.7104473, lng: -74.00891709999999}}
    // ];
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 11,
        styles: styles,
        mapTypeControl: false
    });


    //Initialize map services when ready
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


    //Display default locations' markers on map
    function showMarkers(){
        placesService.textSearch({
            query:"museums New York",
            bounds:map.getBounds()
        },function (results,status) {
            if(status==google.maps.places.PlacesServiceStatus.OK){
                // console.log(results);
                var bounds=new google.maps.LatLngBounds();
                results.forEach(function (each) {
                    var marker = new google.maps.Marker({
                        map: map,
                        title: each.name,
                        position: each.geometry.location,
                        id: each.place_id,
                        formattedAddress: each.formatted_address,
                        flag:true
                    });
                    vm.defaultLocations.push(marker);
                    vm.defaultLocations1.push(marker);
                    marker.addListener("click", function () {
                        marker.setAnimation(google.maps.Animation.DROP);
                        defaultOnClick(marker);
                    });
                    if (each.geometry.viewport) {
                        bounds.union(each.geometry.viewport);
                    } else {
                        bounds.extend(each.geometry.location);
                    }
                });
                addInfoWin(placeMarkers[0], map);

                vm.nearby([]);
                // vm.isDestReady(true);
                map.fitBounds(bounds);

            }
            else {
                console.log("Places service request failed due to "+status);
                alert("Places service request failed due to "+status);
            }
        });
    }
    showMarkers();



}
//initMap ends

function defaultOnClick(marker) {
    vm.currentMarker(marker);
    vm.currentAddress(marker.formattedAddress);
    map.panTo(marker.position);
    if (!vm.isSideBarOpen())
        vm.isNavBackHidden(false);
    vm.searchBtn.flag = false;
    vm.searchBtnIcon(vm.searchBtn.image());
    addInfoWin(marker, map);
    vm.isBtnGroupHidden(false);
    // console.log(this.position.lat()+","+this.position.lng());
    vm.nearby([]);
    $.explore(marker.position.lat()+","+marker.position.lng());
}


function hideMarkers(array) {
    array.forEach(function (each) {
        each.setMap(null);
    })
}

//Search for predictions according to input
function getPredictions(input) {
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
            console.log("Auto complete service request failed due to "+status);
            alert("Auto complete service request failed due to "+status);
        }
    }
}


//Create information window
function addInfoWin(marker, map) {
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
            };
            vm.infoWinTitle(marker.title);
            var panorama = new google.maps.StreetViewPanorama(streetView, panoramaOptions);
        }
        else {
            vm.infoWinTitle("Street view not found");
            console.log("Street view request failed due to "+status);
        }

    }

    streetViewService.getPanoramaByLocation(marker.position, 100, getStreetView);
}

//Search for places according to input
function getPlaces() {
    placesService.textSearch({
        query:vm.location.destination(),
        bounds:map.getBounds()
    },function (results,status) {
        if(status==google.maps.places.PlacesServiceStatus.OK){
            // console.log(results);
            createPlacesMarkers(results,true);
        }
        else {
            console.log("Places service request failed due to "+status);
            alert("Places service request failed due to "+status);
        }
    });

}

function getSinglePlace(place) {
    // console.log(place);

    placesService.textSearch({
        query:place,
        bounds:map.getBounds()
    },function (results,status) {
        if(status==google.maps.places.PlacesServiceStatus.OK){
            // console.log(results);
            createPlacesMarkers(results,false);
        }
        else {
            console.log("Places service request failed due to "+status);
            alert("Places service request failed due to "+status);
        }
    });
}

//Create markers for place results sent back from api
function createPlacesMarkers(places,flag) {
    // console.log(places);
    var bounds=new google.maps.LatLngBounds();
    if(flag) {                                                   //May create multiple markers
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
                vm.currentAddress(marker.formattedAddress);
                map.panTo(this.position);
                if (!vm.isSideBarOpen())
                    vm.isNavBackHidden(false);
                vm.searchBtn.flag = false;
                vm.searchBtnIcon(vm.searchBtn.image());
                addInfoWin(this, map);
                vm.isBtnGroupHidden(false);
                // console.log(this.position.lat()+","+this.position.lng());
                vm.nearby([]);
                $.explore(this.position.lat()+","+this.position.lng());
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
        vm.nearby([]);
        $.explore(vm.destMarker().position.lat()+","+vm.destMarker().position.lng());               //Send a request to foursquare to get
        vm.isDestReady(true);                                                                          //nearby restaurant list
        map.fitBounds(bounds);
    }

    else{                                                           //Create only one marker
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
            vm.currentAddress(marker.formattedAddress);
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
            // console.log(vm.startingMarker());
            vm.isStartingReady(true);
            vm.location.starting(vm.startingMarker().formattedAddress);
            vm.showDirection();
            // console.log(vm.startingMarker());
        }
        else {
            vm.destMarker(marker);
            // console.log(vm.destMarker());
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

        }
        else {
            marker.setMap(map);
            map.fitBounds(bounds);
        }

        }



}

function getFirstPredictions(input) {
    // console.log(input);
    service.getQueryPredictions({input: input}, getAutoPlaces);
    function getAutoPlaces(predictions, status) {
        if(predictions==null){
            console.log("No location entered.");
            return;
        }
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            // console.log(predictions);
            vm.firstPrediction(predictions[0].description);

        }
        else {
            console.log("Auto complete service request failed due to "+status);
            alert("Auto complete service request failed due to "+status);
        }
    }
}
//Request direction information between two places
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
            alert('Directions request failed due to ' + status);
        }
    })
}

function mapError() {
    alert("Loading Google Maps script failed.");
}
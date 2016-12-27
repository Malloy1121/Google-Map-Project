#Neighborhood Map Project

## Run this app
* Download the zip file and decompress it to your local device.
* Open the folder and run "index.html" with your browser.

## Before you use this app
* Get a Google Maps Javascript API key and enable Google Maps APIs on Google Developer Console.
 (Google Maps JavaScript API, Google Maps Roads API, Google Street View Image API, Google Places API Web Service,
  Google Maps Geocoding API, Google Maps Directions API, Google Maps Geolocation API).
* Replace "YourAPIKey" in Google Maps script src at the very bottom of "index.html" with you API key.
* Create a Foursquare account and create a Foursquare API key at "developer.foursquare.com".
* Replace the value of variable "client_id" with your client ID and "client_secret" with your client secret in "js/foursquare.js".

##Directions
* You can enter an address or a place name (such as pizza hut) to locate a spot you are searching for.
* Clicking on a marker can show you detailed information about this spot and restaurants nearby it.
* To see directions between two locations, you can open up the direction panel or you can click on "Depart from here"
  or "Go to here" button on the left panel that appears after you click on a marker.
* You can save a place as your favourite location by clicking on "Save" button with a blue star icon.
* If you want to view your favorite places or update your map settings, click on "hamburger" button on the search bar.
* Some locations with their marker are present by default. You can hide, show or filter them by clicking the "menu" button.

##Source files
* index.html: app homepage.
* js/controller.js: vm part of knockout MVVM.
* js/foursquare.js: process requests to Foursquare api and results sent back from it.
* js/map.js: process interactions with Google Maps api.

##References
* Some of svg images used in this project are provided by "www.flaticon.com". Copyright belongs to the author.
* Map services are provided by Google Maps API.
* Nearby restaurant search service is provided by Foursquare API.
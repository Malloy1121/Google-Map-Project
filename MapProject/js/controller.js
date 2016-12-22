var Mode=function (mode,image) {
    this.mode=mode;
    this.image=image;
    this.isSelected=ko.observable(false);
};

var Location=function () {
    this.starting=ko.observable();
    this.destination=ko.observable();
};

var SlideButton=function (flag) {
    this.next="images/next.svg";
    this.previous="images/back.svg";
    this.flag=flag;
    this.image=function () {
        return this.flag?this.next:this.previous;
    }
};

var SearchButton=function (flag) {
    this.search="images/right-arrow.svg";
    this.close="images/cancel.svg";
    this.flag=flag;
    this.image=function () {
        return this.flag?this.search:this.close;
    }
};

var Food=function () {
    this.name="";
    this.category="";
    this.photo="images/coming-soon.svg";
    this.rating="0";
    this.hours="";
    this.address="";
    this.price="";
    this.ratingColor="#808080";
};

function VM() {
    var self=this;
    this.savedLocations=ko.observableArray();
    this.currentMarker=ko.observable();
    this.startingMarker=ko.observable();
    this.destMarker=ko.observable();
    this.location=new Location();
    this.nearby=ko.observableArray();                       //Store nearby restaurant list
    this.isSideBarOpen=ko.observable(false);
    this.isSideBarHidden=ko.observable(false);
    this.isInputListClose=ko.observable(true);
    this.isNavBackHidden=ko.observable(true);
    this.isNavHidden=ko.observable(true);
    this.isMenuOpen=ko.observable(false);
    this.isBtnGroupHidden=ko.observable(true);
    this.isStartingReady=ko.observable(false);
    this.isDestReady=ko.observable(false);
    this.isShowPredictions=ko.observable(true);
    this.isShowTraffic=ko.observable(false);
    this.isAvoidTolls=ko.observable(false);
    this.isRouteOpen=ko.observable(false);
    this.slide=new SlideButton(false);
    this.searchBtn=new SearchButton(true);
    this.searchBtnIcon=ko.observable(this.searchBtn.image());
    this.navSlide=new SlideButton(false);
    this.predictions=ko.observable();
    this.firstPrediction=ko.observable();
    this.pred_starting=ko.observable();
    this.pred_dest=ko.observable();
    this.toStarting=ko.observable(false);
    this.currentSlide=ko.observable(this.slide.image());
    this.currentNavSlide=ko.observable(this.navSlide.image());
    this.modes=[new Mode("DRIVING","images/sports-car.svg"),
        new Mode("WALKING","images/pedestrian-walking.svg"),
        new Mode("BICYCLING","images/bicycle.svg"),
        new Mode("TRANSIT","images/underground.svg")];
    this.modes[0].isSelected(true);
    this.currentMode=ko.observable(this.modes[0]);

    //Each function does the exactly same job as its function name
    this.selectMode=function () {
        self.modes.forEach(function (e) {
            e.isSelected(false);
        });
        self.currentMode(this);
        this.isSelected(true);
    };

    this.toggleShowTraffic=function () {
        self.isShowTraffic(!self.isShowTraffic());
        if(self.isShowTraffic())
            trafficLayer.setMap(map);
        else
            trafficLayer.setMap(null);
    };

    this.toggleAvoidTolls=function () {
        self.isAvoidTolls(!self.isAvoidTolls());
    };

    this.openMenu=function () {
        this.isMenuOpen(true);
        // console.log(this.isMenuOpen());
    };
    this.closeMenu=function () {
        this.isMenuOpen(false);
    };

    this.toggleSideBar=function () {
        if(!this.isNavBackHidden()){
            this.isNavBackHidden(true);
            this.searchBtn.flag=true;
            this.searchBtnIcon(this.searchBtn.image());
            placeMarkers.forEach(function (each) {
                if(each==self.destMarker()||each==self.startingMarker())
                    return;
                each.setMap(null);
            });
            markers.forEach(function (each) {
                if(each==self.destMarker()||each==self.startingMarker())
                    return;
                each.setMap(null);
            });
        }

        else {
            this.isSideBarOpen(!this.isSideBarOpen());
            directionsRenderer.setMap(null);
            if(!this.isSideBarOpen()) {
                placeMarkers.forEach(function (each) {
                    each.setMap(null);
                    each=null;
                });
                hideMarkers(markers);
                placeMarkers = [];
            }
        }

        if(!this.isSideBarOpen()){
            if(self.startingMarker()) {
                console.log(self.startingMarker());
                self.startingMarker().setMap(null);
                self.startingMarker(null);
            }
            if(self.destMarker()) {
                console.log(self.destMarker());
                self.destMarker().setMap(null);
                self.destMarker(null);
            }
            routes.innerHTML="";
            this.location.destination("");
            this.location.starting("");
            this.isDestReady(false);
            this.isStartingReady(false);
            // console.log("mmm");
            this.isBtnGroupHidden(true);
            this.setPredictions(null);
            this.searchBtn.flag=true;
            this.searchBtnIcon(this.searchBtn.image());
        }



    };

    this.navStarting=function () {
        if(!this.isNavBackHidden()){
            this.isNavBackHidden(true);
            this.searchBtn.flag=true;
            this.searchBtnIcon(this.searchBtn.image());
        }

            this.location.starting(this.currentMarker());
            this.isSideBarOpen(!this.isSideBarOpen());
            this.isSideBarClose(!this.isSideBarClose());
    };

    this.closeSideBar=function () {
        this.isInputListClose(true);

    };

    this.openInputList=function () {
        this.toStarting(false);
        this.isInputListClose(false);
    };

    this.hideSideBar=function () {
        this.isSideBarHidden(!this.isSideBarHidden());
        this.slide.flag=!this.slide.flag;
        this.currentSlide(this.slide.image());
    };

    this.hideNav=function () {
        this.isNavHidden(!this.isNavHidden());
        this.navSlide.flag=!this.navSlide.flag;
        this.currentNavSlide(this.navSlide.image());
    };

    this.getStartingLocation=function () {
        return self.location.starting;
    };

    this.getDest=function () {
        return self.location.destination;
    };

    this.reverseLocation=function () {                              //reserve destination and starting spot
        var starting=self.location.starting();
        var dest=self.location.destination();
        self.location.destination(starting);
        self.location.starting(dest);

        var starting_marker=self.startingMarker();
        self.startingMarker(self.destMarker());
        self.destMarker(starting_marker);
    };

    this.setPredictions=function (array) {
        this.predictions(array);
        // console.log(this.predictions());
    };

    this.setPred_starting=function (array) {
        this.pred_starting(array);
    };

    this.setPred_dest=function (array) {
        this.pred_dest(array);
    };

    this.icon_image=function (icon) {                                   //Toggle search bar icon
        if(icon.place_id)
            return 'images/location-pointer.svg';
        else
            return 'images/magnifying-glass.svg';
        // return icon.place_id==undefined? 'images/location-pointer.svg':'images/magnifying-glass.svg';
    };

    this.setLocation=function (place) {
        if(self.toStarting())
            self.location.starting(place.description);
        else
            self.location.destination(place.description);
        self.predictions(null);
    };

    this.save=function () {                                                             //Save favorite locations
        var flag=true;
        for(var i=0;i<this.savedLocations().length;i++){
            var each=this.savedLocations()[i];
            if(each.formattedAddress==self.currentMarker().formattedAddress){
                flag=false;
                break;
            }
        }
        if(flag) {
            this.savedLocations.push(this.currentMarker());
            console.log(this.savedLocations());
        }
    };


    this.setDestMarker=function(){
        //this.isNavBackHidden(true);
        this.destMarker(this.currentMarker());
        this.isNavBackHidden(true);
        this.isSideBarOpen(true);
        this.isSideBarOpen(true);
        this.location.destination(this.currentMarker().formattedAddress);
        this.isDestReady(true);
    };

    this.setStartingMarker=function () {
        this.destMarker().setMap(null);
        //this.destMarker(null);
        this.location.destination("");
        // this.destMarker(null);
        this.startingMarker(this.currentMarker());
        this.startingMarker().setMap(map);
        // this.toggleSideBar();
        this.isNavBackHidden(true);
        this.isSideBarOpen(true);
        this.isSideBarOpen(true);
        this.location.starting(this.currentMarker().formattedAddress);
        this.isStartingReady(true);
    };

    this.setMarkers=function (prediction,event) {
        self.setLocation(prediction);
        placeMarkers.forEach(function (each) {
            // if(each==self.destMarker()||each==self.startingMarker())
            //     return;
            each.setMap(null);
        });
        placeMarkers=[];

       hideMarkers(markers);

        self.location.destination(prediction.description);
        getPlaces();

    };

    this.setSingleMarker=function (prediction) {
        // console.log(prediction);
        self.searchBtn.flag = true;
        self.searchBtnIcon(vm.searchBtn.image());
        placeMarkers.forEach(function (each) {
            if(each==self.destMarker()||each==self.startingMarker()) {
                //console.log(123321)
                return;
            }
            each.setMap(null);
        });
        // placeMarkers=[];

        hideMarkers(markers);

        getSinglePlace(prediction.description);

        if(self.toStarting()) {
            self.location.starting(prediction.description);
        }
        else {
            self.location.destination(prediction.description);


        }

        if(self.isDestReady()&&self.isStartingReady())
            self.showDirection();
        self.predictions(null);

        //console.log(self.currentMarker());


    };

    this.showDirection=function () {
        hideMarkers(markers);
        if(self.isDestReady()&&self.isStartingReady()) {
            displayDirections();
            return;
        }

        if(!self.isStartingReady()&&self.location.starting()!=null&&self.location.starting().length>0){
            self.toStarting(true);
            getSinglePlace(self.location.starting());
            self.predictions(null);
        }

        if(self.isStartingReady()&&!self.isDestReady()&&self.location.destination()!=null&&self.location.destination().length>0){
            self.toStarting(false);
            getSinglePlace(self.location.destination());
            self.predictions(null);

        }



    };

    this.myLocationClick=function () {                                 //Show detail of a favorite location
        hideMarkers(placeMarkers);
        placeMarkers=[];
        self.toStarting(false);
        self.location.destination(this.formattedAddress);
        getSinglePlace(this.formattedAddress);
        // if (!self.isSideBarOpen())
            self.isNavBackHidden(false);
        self.searchBtn.flag = false;
        self.searchBtnIcon(self.searchBtn.image());
        self.isBtnGroupHidden(false);
        self.isMenuOpen(false);
    };

    this.toggleRoute=function () {
        this.isRouteOpen(!this.isRouteOpen());
    };


}
var vm=new VM();
ko.applyBindings(vm);
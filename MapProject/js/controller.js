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
}

function VM() {
    var self=this;
    this.savedLocations=ko.observableArray();
    this.currentMarker=ko.observable();
    this.startingMarker=ko.observable();
    this.destMarker=ko.observable();
    this.location=new Location();
    this.isSideBarOpen=ko.observable(false);
    this.isSideBarHidden=ko.observable(false);
    this.isInputListClose=ko.observable(true);
    this.isNavBackHidden=ko.observable(true);
    this.isNavHidden=ko.observable(true);
    this.isBtnGroupHidden=ko.observable(true);
    this.isStartingReady=ko.observable(false);
    this.isDestReady=ko.observable(false);
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
    this.currentNavSlide=ko.observable(this.navSlide.image())
    this.modes=[new Mode("DRIVING","images/sports-car.svg"),
        new Mode("WALKING","images/pedestrian-walking.svg"),
        new Mode("BICYCLING","images/bicycle.svg"),
        new Mode("TRANSIT","images/underground.svg")];
    this.modes[0].isSelected(true);
    this.currentMode=ko.observable(this.modes[0]);
    this.selectMode=function () {
        self.modes.forEach(function (e) {
            e.isSelected(false);
        });
        self.currentMode(this);
        this.isSelected(true);
    };

    this.toggleSideBar=function () {
        if(this.isSideBarOpen()){
            if(self.startingMarker()) {
                console.log(self.startingMarker());
                self.startingMarker().setMap(null);
                self.startingMarker(null);
            }
            if(self.destMarker()) {
                console.log(self.destMarker());
                self.destMarker().setMap(null);
                self.startingMarker(null);
            }
        }


        if(!this.isNavBackHidden()){
            this.isNavBackHidden(true);
            this.searchBtn.flag=true;
            this.searchBtnIcon(this.searchBtn.image());
        }

        else {
            this.isSideBarOpen(!this.isSideBarOpen());
            directionsRenderer.setMap(null);
        }

        if(!this.isSideBarOpen()){
            this.location.destination("");
            this.location.starting("");
            this.isDestReady(false);
            this.isStartingReady(false);
            // console.log("mmm");
            this.isBtnGroupHidden(true);
            this.setPredictions(null);
            placeMarkers.forEach(function (each) {
                each.setMap(null);
            });
            markers.forEach(function (each) {
                each.setMap(null);
            });
            placeMarkers=[];
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

            this.location.starting(this.currentMarker())
            this.isSideBarOpen(!this.isSideBarOpen());
            this.isSideBarClose(!this.isSideBarClose());
    };

    this.closeSideBar=function () {
        this.isInputListClose(true);

    };

    this.openInputList=function () {
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

    this.reverseLocation=function () {
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

    this.icon_image=function (icon) {
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

    this.save=function () {
        this.savedLocations.push(this.currentMarker);
       console.log(this.savedLocations()[0]());
    };


    this.setDestMarker=function(){
        //this.isNavBackHidden(true);
        this.destMarker(this.currentMarker());
        this.toggleSideBar();
        this.isSideBarOpen(true);
        this.location.destination(this.currentMarker().formattedAddress);
        this.isDestReady(true);
    };

    this.setStartingMarker=function () {
        this.startingMarker(this.currentMarker());
        this.toggleSideBar();
        this.isSideBarOpen(true);
        this.location.starting(this.currentMarker().formattedAddress);
        this.isStartingReady(true);
    };

    this.setMarkers=function (prediction,event) {
        self.setLocation(prediction);
        placeMarkers.forEach(function (each) {
            if(each==self.destMarker()||each==self.startingMarker())
                return;
            each.setMap(null);
        });
        placeMarkers=[];

        markers.forEach(function (each) {
            each.setMap(null);
        });

        self.location.destination(prediction.description);
        getPlaces();
        // if(placeMarkers.length>0) {
        //     console.log(placeMarkers[0])
        //     self.destMarker(placeMarkers[0]);
        //     self.isDestReady(true);
        // }
    };

    this.setSingleMarker=function (prediction,event) {
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

        markers.forEach(function (each) {
            each.setMap(null);
        });

        getSinglePlace(prediction.description);

        if(self.toStarting()) {
            self.location.starting(prediction.description);
            // self.startingMarker(self.currentMarker());
            // console.log(self.currentMarker(),self.startingMarker());
            // self.isStartingReady(true);
            if(self.isDestReady()&&self.isStartingReady())
                self.showDirection();
        }
        else {
            self.location.destination(prediction.description);
            // self.destMarker(self.currentMarker());
            // console.log(self.currentMarker(),self.destMarker());
            // self.isDestReady(true);
            if(self.isDestReady()&&self.isStartingReady())
                self.showDirection();

        }
        self.predictions(null);

        //console.log(self.currentMarker());


    };

    this.showDirection=function () {
        // console.log(self.startingMarker()," ",self.destMarker());
        if(!self.isNavBackHidden()){
            self.isNavBackHidden(true);
        }

        if(self.isDestReady()&&self.isStartingReady())
            displayDirections();
    };

}
var vm=new VM();
ko.applyBindings(vm);
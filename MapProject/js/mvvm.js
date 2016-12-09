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
    this.location=new Location();
    this.isSideBarOpen=ko.observable(false);
    this.isSideBarClose=ko.observable(true);
    this.isSideBarHidden=ko.observable(false);
    this.isInputListClose=ko.observable(true);
    this.isNavBackHidden=ko.observable(true);
    this.isNavHidden=ko.observable(true);
    this.slide=new SlideButton(false);
    this.searchBtn=new SearchButton(true);
    this.searchBtnIcon=ko.observable(this.searchBtn.image());
    this.navSlide=new SlideButton(false);
    this.predictions=ko.observable();
    this.pred_starting=ko.observable();
    this.pred_dest=ko.observable();
    this.toStarting=ko.observable(false);
    this.currentSlide=ko.observable(this.slide.image());
    this.currentNavSlide=ko.observable(this.navSlide.image())
    this.modes=[new Mode("drive","images/sports-car.svg"),
        new Mode("walking","images/pedestrian-walking.svg"),
        new Mode("bike","images/bicycle.svg"),
        new Mode("transit","images/underground.svg")];
    this.modes[0].isSelected(true);
    this.currentMode=this.modes[0];
    this.selectMode=function () {
        self.modes.forEach(function (e) {
            e.isSelected(false);
        });
        self.currentMode=this;
        this.isSelected(true);
    }

    this.toggleSideBar=function () {
        // if(this.isSideBarClose()) {
        //     this.searchBtn.flag=!this.searchBtn.flag;
        //     this.searchBtnIcon(this.searchBtn.image());
        // }

        if(!this.isNavBackHidden()){
            this.isNavBackHidden(true);
            this.searchBtn.flag=true;
            this.searchBtnIcon(this.searchBtn.image());
            console.log(this.searchBtnIcon());

        }


        // this.searchBtnIcon(this.searchBtn.image());
        else {
            this.isSideBarOpen(!this.isSideBarOpen());
            this.isSideBarClose(!this.isSideBarClose());
        }

        if(this.isSideBarClose()){
            this.location.destination("");
            this.location.starting("");
            this.setPredictions(null);
            placeMarkers.forEach(function (each) {
                each.setMap(null);
            });
            placeMarkers=[];
        }
    }

    this.closeSideBar=function () {
        this.isInputListClose(true);

    }

    this.openInputList=function () {
        this.isInputListClose(false);
    }

    this.hideSideBar=function () {
        this.isSideBarHidden(!this.isSideBarHidden());
        this.slide.flag=!this.slide.flag;
        this.currentSlide(this.slide.image());
    }

    this.hideNav=function () {
        this.isNavHidden(!this.isNavHidden());
        this.navSlide.flag=!this.navSlide.flag;
        this.currentNavSlide(this.navSlide.image());
    }

    this.getStartingLocation=function () {
        return self.location.starting;
    }

    this.getDest=function () {
        return self.location.destination;
    }

    this.reverseLocation=function () {
        var starting=self.location.starting();
        var dest=self.location.destination();
        self.location.destination(starting);
        self.location.starting(dest);
    }

    this.setPredictions=function (array) {
        this.predictions(array);
        console.log(this.predictions());
    }

    this.setPred_starting=function (array) {
        this.pred_starting(array);
    }

    this.setPred_dest=function (array) {
        this.pred_dest(array);
    }

    this.icon_image=function (icon) {
        if(icon.place_id)
            return 'images/location-pointer.svg';
        else
            return 'images/magnifying-glass.svg';
        // return icon.place_id==undefined? 'images/location-pointer.svg':'images/magnifying-glass.svg';
    }

    this.setLocation=function (place,event) {
        if(self.toStarting())
            self.location.starting(place.description);
        else
            self.location.destination(place.description);
        self.predictions(null);
    }




}
var vm=new VM();
ko.applyBindings(vm);
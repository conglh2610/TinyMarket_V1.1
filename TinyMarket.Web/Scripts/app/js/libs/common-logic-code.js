//'use strict';

//define(["myApp"], function (myApp) {

//    var injectParams = ['$modal'];
//    var serviceCommon = function () {

//        this.formatDateTime = function (date) {

//            alert("aaaaa");
//        }
//    };

//    modalService.$inject = injectParams;
//    //Must be a provider since it will be injected into module.config()    
//    serviceCommon.service('serviceCommon', serviceCommon);
//});

//Service style, probably the simplest one
myApp.service('serviceCommon', ['$http', '$q', '$filter', function ($http, $q, $filter) {

    this.timeForDisplay = function (date) {
        var timeForDisplay = ""

        var T1 = new Date(Date.now());
        var T2 = new Date(date);
        var timeDiff = new Date();
        timeDiff.setTime(T1 - T2);

        var subtractDate = Math.floor(timeDiff / (1000 * 3600 * 24));
        var subtractHours = timeDiff.getHours();
        var subtractMinutes = timeDiff.getMinutes();
        if (subtractDate == 0) {
            if (subtractHours == 0) {
                if (subtractMinutes == 0) {
                    timeForDisplay = "Vừa mới đăng";
                }
                else {
                    timeForDisplay = "đăng cách đây " + subtractMinutes + "phút";
                }
            }
            else {
                if (subtractMinutes == 0)

                    timeForDisplay = "đăng cách đây " + diff.getHours() + " giờ";
                else
                    timeForDisplay = "đăng cách đây " + diff.getHours() + " giờ " + diff.getMinutes() + " phút";
            }
        }
        else if (subtractDate == 1) {
            timeForDisplay = "đăng hôm qua";
        }

        else {
            timeForDisplay = "đăng thứ " + T2.getDay() + " ngày " + T2.getDate() + " tháng " + T2.getMonth();
        }

        return timeForDisplay;
    }
}]);
myApp.controller('newPostConfirm', ['$scope', '$timeout', '$window', function ($scope, $timeout) {
    $scope.$context.behavior.entering = function (options, callback) {
        $scope.confirmForm.$setPristine();
        if (options.entered) {
            return callback();
        } else {
            $timeout(function () {
                angular.forEach($scope.$context.data.imageFiles, function (value, key) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(value.file);
                    fileReader.onload = function (e) {
                        $timeout(function () {
                            var imageData = e.target.result;
                            var element = '<img id="' + key + '" style="background-image: url(' + imageData + '); background-size: cover;" height="96" width="96"/>';
                            $("#imagesSection").append(element);
                        });
                    }
                    return callback();
                });
                return callback();
            }, 5);
        }
    };
    $scope.$context.behavior.leaving = function (options, callback) {
        if (options.forward) {
            $timeout(function () {
                $scope.confirmForm.$setSubmitted();
                return callback($scope.confirmForm.$valid);
            }, 5);
        } else {
            return callback(true);
        }
    };
}]);

myApp.directive('verifyPassword', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, model) {
            if (!attrs.verifyPassword) {
                console.error('nxEqual expects a model as an argument!');
                return;
            }
            scope.$watch(attrs.verifyPassword, function (value) {
                model.$setValidity('verifyPassword', value === model.$viewValue);
            });
            model.$parsers.push(function (value) {
                var isValid = value === scope.$eval(attrs.verifyPassword);
                model.$setValidity('verifyPassword', isValid);
                return isValid ? value : undefined;
            });
        }
    };
});
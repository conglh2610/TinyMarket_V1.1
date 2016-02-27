myApp.controller('newPostBasicInfo', ['$scope', '$timeout', '$window', function ($scope, $timeout, $window) {
    $scope.$context.behavior.entering = function (options, callback) {
        if (options.entered) {
            return callback();
        } else {
            $scope.typesModel = 'isSelling';
            $timeout(function () {
                $scope.$watchCollection('typesModel', function () {
                    if ($scope.typesModel == "isBuying")
                        $scope.$context.data.model.IsBuying = true;
                    else
                        $scope.$context.data.model.IsBuying = false;
                });
                return callback();
            }, 5);
        }
    };
    $scope.$context.behavior.leaving = function (options, callback) {
        if (options.forward) {
            $timeout(function () {
                $scope.$context.data.imageFiles = $scope.interface.getFiles($scope.interface.FILE_TYPES.VALID);
                if ($scope.$context.data.model.CategoryDetailModel.Id)
                {
                    $scope.$context.data.model.CategoryDetailId = $scope.$context.data.model.CategoryDetailModel.Id;
                }

                if ($scope.$context.data.model.RegionModel.Id) {
                    $scope.$context.data.model.RegionId = $scope.$context.data.model.RegionModel.Id;
                }
                $scope.informationForm.$setSubmitted();
                return callback($scope.informationForm.$valid);
            }, 5);
        } else {
            return callback(true);
        }
    };
}]);


myApp.directive('sgOptionsDisabled', function ($parse) {
    var disableOptions = function (scope, attr, element, data, fnDisableIfTrue) {
        // refresh the disabled options in the select element.
        var containsEmptyOption = element.find("option[value='']").length != 0;
        angular.forEach(element.find("option"), function (value, index) {
            var elem = angular.element(value);
            if (elem.val() != "") {
                var locals = {};
                //ST-Software modification (index-1 because of the initial empty option)
                var i = containsEmptyOption ? index - 1 : index;
                locals[attr] = data[i];
                elem.attr("disabled", "true");
                //elem.attr("disabled", fnDisableIfTrue(locals));
            }
        });
    };
    return {
        priority: 0,
        require: 'ngModel',
        link: function (scope, iElement, iAttrs, ctrl) {
            // parse expression and build array of disabled options
            var expElements = iAttrs.sgOptionsDisabled.match(/^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
            var attrToWatch = expElements[3];
            var fnDisableIfTrue = $parse(expElements[1]);
            scope.$watch(attrToWatch, function (newValue, oldValue) {
                if (newValue)
                    disableOptions(scope, expElements[2], iElement, newValue, fnDisableIfTrue);
            }, true);
            // handle model updates properly
            scope.$watch(iAttrs.ngModel, function (newValue, oldValue) {
                var disOptions = $parse(attrToWatch)(scope);
                if (newValue)
                    disableOptions(scope, expElements[2], iElement, disOptions, fnDisableIfTrue);
            });
        }
    };
});

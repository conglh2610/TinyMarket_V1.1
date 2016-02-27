
myApp.controller('newPost', ['$scope',
                             'serviceCommon',
                             'regionService',
                             'categoryService',
                             '$timeout',   function ($scope,
                                                     serviceCommon,
                                                     regionService,
                                                     categoryService,
                                                     $timeout)
{

    $scope.data = {};
    var getAllRegions = function () {
        regionService.getAllRegions().then(function (results) {
            $scope.data.regionDataSource = results.data;
        });
    }

    var getAllCategories = function () {
        categoryService.getAllCategories().then(function (results) {
            $scope.data.categoryDataSource = categoryAddAndDisableParent(results.data);
        });
    }

    getAllRegions();
    getAllCategories();

    var categoryAddAndDisableParent = function (categoryData) {
        var result = [];
        var categoryId = 0;
        for (var i = 0; i < categoryData.length; i++) {
            if (categoryId != categoryData[i].CategoryId) {
                var newParent = { Id: 0, Name: '--' + categoryData[i].Category.Name + '--', IsDisabled: true }
                result.push(newParent);
                categoryId = categoryData[i].CategoryId;
            }

            else {
                var newChild = { Id: categoryData[i].Id, Name: categoryData[i].Name, IsDisabled: false }
                result.push(newChild);
            }
        }

        return result;
    }

    /**
        * @property interface
        * @type {Object}
        */
    $scope.interface = {};

    /**
     * @property uploadCount
     * @type {Number}
     */
    $scope.uploadCount = 0;

    /**
     * @property success
     * @type {Boolean}
     */
    $scope.success = false;

    /**
     * @property error
     * @type {Boolean}
     */
    $scope.error = false;

    // Listen for when the interface has been configured.
    $scope.$on('$dropletReady', function whenDropletReady(event, args) {

        $scope.interface = args;
        $scope.interface.allowedExtensions(['png', 'jpg', 'bmp', 'gif', 'svg', 'torrent']);
        $scope.interface.setRequestUrl('api/posts/savepost');
        $scope.interface.defineHTTPSuccess([/2.{2}/]);
        $scope.interface.useArray(false);

    });

    // Listen for when the files have been successfully uploaded.
    $scope.$on('$dropletSuccess', function onDropletSuccess(event, response, files) {

        $scope.uploadCount = files.length;
        $scope.success = true;
        $scope.data.images = files;
        //console.log(response, files);

        $timeout(function timeout() {
            $scope.success = false;
        }, 5000);

    });

    // Listen for when the files have failed to upload.
    $scope.$on('$dropletError', function onDropletError(event, response) {

        $scope.error = true;
        console.log(response);

        $timeout(function timeout() {
            $scope.error = false;
        }, 5000);

    });


   
}])
    .directive('progressBar', function ProgressbarDirective() {

    return {

        /**
         * @property restrict
         * @type {String}
         */
        restrict: 'A',

        /**
         * @property scope
         * @type {Object}
         */
        scope: {
            model: '=ngModel'
        },

        /**
         * @property ngModel
         * @type {String}
         */
        require: 'ngModel',

        /**
         * @method link
         * @param scope {Object}
         * @param element {Object}
         * @return {void}
         */
        link: function link(scope, element) {

            var progressBar = new ProgressBar.Path(element[0], {
                strokeWidth: 2
            });

            scope.$watch('model', function() {

                progressBar.animate(scope.model / 100, {
                    duration: 1000
                });

            });

            scope.$on('$dropletSuccess', function onSuccess() {
                progressBar.animate(0);
            });

            scope.$on('$dropletError', function onSuccess() {
                progressBar.animate(0);
            });

        }

    }

});



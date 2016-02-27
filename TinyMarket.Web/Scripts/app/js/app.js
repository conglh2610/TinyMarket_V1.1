'use strict';

var myApp = angular.module('myApp', [
    'ngAnimate',
    'ngRoute',
    'ui.bootstrap',
    'sx.wizard',
    'isteven-multi-select',
    'ngDroplet',
    'com.devnup.alert'
]);
myApp.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/main', {
        templateUrl: 'views/main.htm',
        controller: 'mainController'
    });

    $routeProvider.when('/getting-started', {
        templateUrl: 'views/getting-started.htm'
    });

    $routeProvider.when('/configs-options', {
        templateUrl: 'views/configs-options.htm',
    });

    $routeProvider.when('/new-post', {
        controller: 'newPost'
    });

    $routeProvider.when('/demo-custom', {
        templateUrl: 'views/demo-custom.htm',
        controller: 'demoCustom'
    });

    $routeProvider.otherwise({
        redirectTo: '/main'
    });

}]);

myApp.controller('appController', ['$scope', 'serviceCommon', 'regionService', 'categoryService', '$timeout', '$wizard',
                          function ($scope, serviceCommon, regionService, categoryService, $timeout, $wizard) {

                              $scope.config = {
                                  size: 'lg',
                                  title: 'Tạo thông tin rao vặt',
                                  shadow: true,
                                  passthrough: false
                              };

                              var wizard = $wizard
                                  .$new({
                                      title: $scope.config.title,
                                      size: $scope.config.size,
                                      shadow: $scope.config.shadow,
                                      successing: function ($data, $step, $isLastStep, callback) {
                                          alert(window.angular.toJson($data, true));
                                          return callback(true);
                                      }
                                  })
                                  .addStep({
                                      index: 1,
                                      id: 'step-1-infor',
                                      title: 'Tạo tin',
                                      templateUrl: 'views/step-01-information.html',
                                      controller: 'newPostBasicInfo'
                                  })
                                  .addStep({
                                      index: 2,
                                      id: 'step-2-confirm',
                                      title: 'Xác nhận',
                                      templateUrl: 'views/step-02-confirm.html',
                                      controller: 'newPostConfirm'
                                  })
                                  .addStep({
                                      index: 3,
                                      id: 'step-03-finish',
                                      title: 'Hoàn tất',
                                      templateUrl: 'views/step-03-finish.html',
                                      controller: 'newPostFinish'
                                  });
                              $scope.launch = function () {
                                  getAllRegions();
                                  getAllCategories();
                                  wizard.open(
                                      $scope.data,
                                      function (result) {
                                          $scope.result = result;
                                      },
                                      window.angular.noop);
                              };

                              $scope.data = {};
                              $scope.data.model = {};
                              $scope.data.imageFiles = {};
                              var getAllRegions = function () {
                                  regionService.getAllRegions().then(function (results) {
                                          $scope.data.model.regionDataSource = results.data;
                                  });
                              }

                              var getAllCategories = function () {
                                  categoryService.getAllCategories().then(function (results) {
                                      $scope.data.model.categoryDataSource = categoryService.categoryAddAndDisableParent(results.data);
                                  });
                              }

                              $scope.interface = {};
                              $scope.uploadCount = 0;
                              $scope.success = false;
                              $scope.error = false;
                              $scope.$on('$dropletReady', function whenDropletReady(event, args) {

                                  $scope.interface = args;
                                  $scope.interface.allowedExtensions(['png', 'jpg', 'bmp', 'gif', 'svg', 'torrent']);
                                  $scope.interface.setRequestUrl('api/posts/savepost');
                                  $scope.interface.defineHTTPSuccess([/2.{2}/]);
                                  $scope.interface.useArray(false);

                              });

                              $scope.$on('$dropletSuccess', function onDropletSuccess(event, response, files) {

                                  $scope.uploadCount = files.length;
                                  $scope.success = true;
                                  $scope.data.images = files;
                                  console.log(response, files);

                                  $timeout(function timeout() {
                                      $scope.success = false;
                                  }, 5000);

                              });

                              $scope.$on('$dropletError', function onDropletError(event, response) {

                                  $scope.error = true;
                                  console.log(response);

                                  $timeout(function timeout() {
                                      $scope.error = false;
                                  }, 5000);

                              });
                          }]);


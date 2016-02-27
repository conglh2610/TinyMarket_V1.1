(function () {
    'use strict';

    var module = window.angular.module('sx.wizard', ['ui.bootstrap', 'sx.wizard.tpls']);

    module.factory('$wizard', ['$q', '$http', '$templateCache', '$modal', '$wizardConsts',
        function ($q, $http, $templateCache, $modal, $wizardConsts) {

            var _getTemplatePromise = function (step) {
                if (step.template) {
                    step.template = '<div class="sx-wizard-step" sx-wizard-step-id="' + step.id + '">' + step.template + '</div>';
                    return $q.when(step);
                }
                else {
                    return $http.get(step.templateUrl, { cache: $templateCache }).then(function (response) {
                        step.template = '<div class="sx-wizard-step" sx-wizard-step-id="' + step.id + '">' + response.data + '</div>';
                        return step;
                    });
                }
            };

            return {
                $new: function (opts) {
                    var $wizard = this;
                    var wizard = {
                        _steps: {},
                        _stepsOrder: [],
                        _stepTemplatePromises: [],
                        _options: {
                            successing: function ($data, $step, $isLastStep, callback) {
                                return callback(true);
                            },
                            size: 'lg',
                            backdrop: 'static',
                            title: 'Wizard',
                            templateUrl: $wizardConsts.template,
                            shadow: true
                        }
                    };

                    wizard._options = window.angular.extend({}, wizard._options, opts);

                    wizard.addStep = function (step) {
                        var self = this;
                        step.title = step.title || step.id;
                        step.controller = step.controller || window.angular.noop;
                        step.parameters = step.parameters || {};
                        self._steps[step.id] = step;
                        self._stepsOrder.push(step.id);
                        self._stepTemplatePromises.push(_getTemplatePromise(step));
                        return wizard;
                    };


                    wizard.open = function (data, success, cancel) {
                        var self = this;

                        data = data || {};
                        success = success || window.angular.noop;
                        cancel = cancel || window.angular.noop;

                        $q.all(self._stepTemplatePromises).then(function () {
                            var instance = $modal.open({
                                templateUrl: self._options.templateUrl,
                                controller: ['$scope', '$modalInstance', '$data', '$steps', '$stepsOrder',
                                    function ($scope, $modalInstance, $data, $steps, $stepsOrder) {
                                        $scope.$data = $data;
                                        $scope.$steps = $steps;
                                        $scope.$stepsOrder = $stepsOrder;
                                        $scope.$current = {};
                                        $scope.$modalInstance = $modalInstance;

                                        $scope._title = self._options.title;
                                        $scope._history = [];
                                        $scope._entering = false;
                                        $scope._leaving = false;
                                        $scope._shadow = self._options.shadow;

                                        $scope.$watch(function () {
                                            if ($scope.$current.step && $scope.$current.step.$context && $scope.$current.index >= 0) {
                                                return $scope.$current.step.$context.navigation.showFinish || ($scope.$current.index >= self._stepsOrder.length - 1);
                                            }
                                            else {
                                                return true;
                                            }
                                        }, function (showFinishButton) {
                                            $scope._showFinishButton = showFinishButton;
                                        });

                                        $scope.success = function () {
                                            $scope._onLeaving(Number.MAX_VALUE, null, function (valid) {
                                                if (valid) {
                                                    $scope._leaving = true;
                                                    self._options.successing($scope.$data, $scope.$current.step, $scope.$current.index >= self._stepsOrder.length - 1, function (valid) {
                                                        $scope._leaving = false;
                                                        if (valid) {
                                                            $modalInstance.close($scope.$data);
                                                        }
                                                    });
                                                }
                                            });
                                        };

                                        $scope.cancel = function () {
                                            $modalInstance.dismiss();
                                        };

                                        $scope._onLeaving = function (toIndex, toStep, callback) {
                                            // current step might be "undefined" when wizard was shown firstly
                                            if ($scope.$current.step) {
                                                var leaving = $scope.$current.step.$context.behavior.leaving;
                                                var options = {
                                                    toStepId: toStep && toStep.id,
                                                    forward: $scope.$current.index <= toIndex
                                                };
                                                $scope._leaving = true;
                                                leaving.apply($scope.$current.step.$controller, [options,
                                                    function (valid) {
                                                        $scope._leaving = false;
                                                        return callback(valid);
                                                    }
                                                ]);
                                            }
                                            else {
                                                return callback(true);
                                            }
                                        };

                                        $scope._onEntering = function (fromIndex, fromStep, callback) {
                                            var entering = $scope.$current.step.$context.behavior.entering;
                                            var options = {
                                                fromStepId: fromStep && fromStep.id,
                                                forward: fromIndex <= $scope.$current.index,
                                                entered: $scope.$current.step.entered || false
                                            };
                                            $scope._entering = true;
                                            entering.apply($scope.$current.step.$controller, [options,
                                                function () {
                                                    $scope._entering = false;
                                                    $scope.$current.step.entered = true;
                                                    return callback();
                                                }
                                            ]);
                                        };

                                        $scope.goById = function (stepOrId, isPrevious) {
                                            var id = window.angular.isString(stepOrId) ? stepOrId : (stepOrId && stepOrId.id);
                                            if (id === $wizard.$constants.finishStepId) {
                                                $scope.success();
                                            }
                                            else {
                                                var step = self._steps[id];
                                                if (step) {
                                                    var index = self._stepsOrder.indexOf(id);
                                                    if (index >= 0) {
                                                        $scope._onLeaving(index, step, function (valid) {
                                                            if (valid) {
                                                                var fromIndex = $scope.$current.index || -1;
                                                                var fromStepId = $scope.$current.step && $scope.$current.step.id;
                                                                // if it is came from previous step and contains history then pop
                                                                if (isPrevious && $scope._history.length > 0) {
                                                                    $scope._history.pop();
                                                                }
                                                                // if it is not came from previous step and has current step then push current into history
                                                                if (!isPrevious && $scope.$current.step) {
                                                                    $scope._history.push($scope.$current.step.id);
                                                                }
                                                                // navigate
                                                                $scope.$current.index = index;
                                                                $scope.$current.step = step;
                                                                $scope._onEntering(fromIndex, self._steps[fromStepId], function () {
                                                                    $scope._showFinishButton = ($scope.$current.index >= self._stepsOrder.length - 1);
                                                                });
                                                            }
                                                        });
                                                    }
                                                }
                                            }
                                        };

                                        $scope.go = function (index, isPrevious) {
                                            if (index >= 0 && index <= self._stepsOrder.length - 1) {
                                                var id = self._stepsOrder[index];
                                                $scope.goById(id, isPrevious);
                                            }
                                        };

                                        $scope.post = function () {
                                            var deferred = $q.defer();

                                            //var formData = new FormData();
                                            //formData.append("model", angular.toJson($scope.$data.model));
                                            //for (var i = 0; i < $scope.$data.imageFiles.length; i++) {
                                            //    formData.append("file" + i, $scope.$data.imageFiles[i].file);
                                            //}

                                            //$http({
                                            //    method: 'POST',
                                            //    url: "api/posts/savepost",
                                            //    contentType: false,
                                            //    //processData: false,
                                            //    transformRequest: function (data) {

                                            //    },
                                            //    data: formData
                                            //}).success(function (data, status, headers, config) {

                                            //    var results = [];

                                            //    results.data = data;
                                            //    results.headers = headers();
                                            //    results.status = status;
                                            //    results.config = config;

                                            //    deferred.resolve(results);

                                            //    $scope.next();
                                            //}).error(
                                            //deferred.reject
                                            //);

                                            var formData = new FormData();
                                            formData.append("model", angular.toJson( $scope.$data.model));
                                            for (var i = 0; i < $scope.$data.imageFiles.length; i++) {
                                                formData.append("file" + i, $scope.$data.imageFiles[i].file);
                                            }

                                            $http.post("api/posts/savepost", formData, {
                                                transformRequest: angular.identity,
                                                headers: { 'Content-Type': undefined }
                                            })
                                            .success(function () {
                                            })
                                            .error(function () {
                                            });

                                        };

                                        $scope.next = function () {
                                            var nextStepId = $scope.$current.step.$context.navigation.nextStepId;
                                            if (nextStepId) {
                                                $scope.goById(nextStepId, false);
                                            }
                                            else {
                                                $scope.go($scope.$current.index + 1, false);
                                            }
                                        };

                                        $scope.previous = function () {
                                            if ($scope._history.length > 0) {
                                                // do not pop from history right now
                                                // pop it when validation passed 
                                                $scope.goById($scope._history[$scope._history.length - 1], true);
                                            }
                                        };
                                        $scope.showShadow = function (isLeaving) {
                                            if (isLeaving) {
                                                $scope._leaving = true;
                                            }
                                            else {
                                                $scope._entering = true;
                                            }
                                        };
                                        $scope.hideShadow = function () {
                                            $scope._leaving = false;
                                            $scope._entering = false;
                                        };
                                    }
                                ],
                                size: self._options.size,
                                resolve: {
                                    $data: function () {
                                        return window.angular.copy(data);
                                    },
                                    $steps: function () {
                                        return self._steps;
                                    },
                                    $stepsOrder: function () {
                                        return self._stepsOrder;
                                    }
                                },
                                backdrop: self._options.backdrop
                            });
                            instance.result.then(function (data) {
                                return success(data);
                            }, function () {
                                return cancel();
                            });
                        });
                    };

                    return wizard;
                },
                $constants: {
                    finishStepId: '$$finish'
                }
            };
        }
    ]);

    module.directive('sxWizard', ['$compile', '$controller',
        function ($compile, $controller) {
            return {
                scope: {
                    $data: '=sxWizard',
                    $steps: '=sxWizardSteps',
                    $current: '=sxWizardCurrentStep',
                    $init: '&sxWizardInit',
                    $showShadow: '&sxWizardShowShadow',
                    $hideShadow: '&sxWizardHideShadow'
                },
                link: function (scope, element, attributes, controllers) {
                    // CongLH enhencement

                    var wizardContent = '<ul class="steps">'


                    var _stepElements = [];
                    var _steps = {};

                    window.angular.forEach(scope.$steps, function (step, id) {
                        _steps[id] = {
                            id: id,
                            title: step.title
                        };
                        if (step.index == 1) {
                            wizardContent += '<li><span id="span' + step.index + '" class="badge badge-info">' + step.index + '</span>' + step.title + '<span class="chevron"></span></li>'
                        }
                        else {
                            wizardContent += '<li><span id="span' + step.index + '" class="badge">' + step.index + '</span>' + step.title + '<span class="chevron"></span></li>'
                        }
                    });

                    wizardContent + '</ul>';
                    var fueluTag = $('.fuelux').html(wizardContent);

                    window.angular.forEach(scope.$steps, function (step, id) {
                        var template = step.template;
                        var controller = step.controller;
                        var templateScope = scope.$new();
                        templateScope.$context = {
                            data: scope.$data,
                            parameters: step.parameters,
                            steps: _steps,
                            currentStepId: scope.$current.step && scope.$current.step.id,
                            navigation: {
                                showFinish: false,
                                nextStepId: null,
                                buttons: []
                            },
                            behavior: {
                                shadow: function (isLeaving, fn) {
                                    try {
                                        scope.$showShadow(isLeaving);
                                        return fn(function () {
                                            scope.$hideShadow();
                                        });
                                    }
                                    catch (_) {
                                        scope.$hideShadow();
                                    }
                                },
                                entering: function (options, callback) {
                                    return callback();
                                },
                                leaving: function (options, callback) {
                                    return callback(true);
                                }
                            }
                        };
                        step.$controller = $controller(controller, {
                            $scope: templateScope
                        });
                        step.$context = templateScope.$context;
                        step.entered = false;
                        element.append(template);
                        var templateElement = element.find('[sx-wizard-step-id="' + id + '"]');
                        $compile(templateElement.contents())(templateScope);
                        _stepElements.push(templateElement);
                    });

                    scope.$watch('$current.step', function (step) {
                        var steps = $(".fuelux > .steps > li");
                        for (var i = 0; i < steps.length; i++) {
                            var isComplete = i < (step.index - 1);
                            var isActive = i == (step.index - 1);
                            var e = angular.element(steps[i]);

                            if (isComplete) {
                                e.removeAttr("class");
                                e.attr('class', 'complete');

                                var span = e.find('#span' + (i + 1));
                                span.removeAttr('class');
                                span.attr('class', 'badge badge-success');
                            }
                            else if (isActive) {
                                e.removeAttr("class");
                                e.attr('class', 'active');

                                var span = e.find('#span' + (i + 1));
                                span.removeAttr('class');
                                span.attr('class', 'badge badge-info');
                            }
                            else {
                                e.removeAttr("class");
                            }
                        }
                        if (step) {
                            window.angular.forEach(_stepElements, function (stepElement) {
                                if (stepElement.attr('sx-wizard-step-id') === step.id) {
                                    stepElement.show();
                                }
                                else {
                                    stepElement.hide();
                                }
                            });
                        }
                    });

                    scope.$init();
                }
            };
        }
    ]);

    module.controller('newPostController', ['$scope',
                                 'serviceCommon',
                                 'regionService',
                                 'categoryService',
                                 '$timeout', function ($scope,
                                                         serviceCommon,
                                                         regionService,
                                                         categoryService,
                                                         $timeout) {

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
}());
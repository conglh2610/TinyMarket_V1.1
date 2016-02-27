(function($angular) {

    "use strict";

    // The truest wisdom is a resolute determination...
    var module = $angular.module('ngDroplet', []).directive('droplet', ['$rootScope', '$window', '$timeout', '$q',

    function DropletDirective($rootScope, $window, $timeout, $q) {

        return {
            restrict: 'EA',
            require: '?ngModel',
            scope: {
                interface: '=ngModel'
            },
            controller: ['$scope', function DropletController($scope) {

                $scope.FILE_TYPES = { VALID: 1, INVALID: 2, DELETED: 4, UPLOADED: 8, FAILED: 16 };

                // Dynamically add the `ALL` property.
                $scope.FILE_TYPES.ALL = Object.keys($scope.FILE_TYPES).reduce(function map(current, key) {
                    return (current |= $scope.FILE_TYPES[key]);
                }, 0);

                $scope.files = [];
                $scope.isUploading = false;
                $scope.isError = false;

                var _isValid = function _isValid(value, values) {

                    var conditionallyLowercase = function conditionallyLowercase(value) {

                        if (typeof value === 'string') {
                            return value.toLowerCase();
                        }

                        return value;

                    };

                    return values.some(function some(currentValue) {

                        var isRegExp = (currentValue instanceof $window.RegExp);

                        if (isRegExp) {

                            // Evaluate the status code as a regular expression.
                            return currentValue.test(conditionallyLowercase(value));

                        }

                        return conditionallyLowercase(currentValue) === conditionallyLowercase(value);

                    });

                };

                $scope.getEvent = function getEvent(event) {

                    if ('originalEvent' in event) {

                        // jQuery likes to send across its own event, and place the original event
                        // in the `originalEvent` property.
                        return event.originalEvent;

                    }

                    return event;

                };

                $scope.isValidHTTPStatus = function isValidHTTPStatus(statusCode) {
                    return _isValid(statusCode, $scope.options.statuses.success);
                };

                $scope.isValidExtension = function isValidExtension(extension) {
                    return _isValid(extension, $scope.options.extensions);
                };

                $scope.options = {

                    requestUrl: '',

                    disableXFileSize: false,

                    parserFn: function parserFunction(responseText) {
                        return $window.JSON.parse(responseText);
                    },

                    useArray: true,

                    maximumValidFiles: Infinity,

                    requestHeaders: {},

                    requestPostData: {},

                    extensions: [],

                    statuses: {

                        success: [/2.{2}/]

                    }
                };

                $scope.requestProgress = { percent: 0, total: 0, loaded: 0 };

                $scope.listeners = {

                    files: [],

                    deferred: null,

                    httpRequest: null,

                    success: function success() {

                        this.httpRequest.onreadystatechange = function onReadyStateChange() {

                            if (this.httpRequest.readyState === 4) {

                                if ($scope.isValidHTTPStatus(this.httpRequest.status)) {

                                    $scope.$apply(function apply() {

                                        // Parse the response, and then emit the event passing along the response
                                        // and the uploaded files!

                                        function parseJSON(str) {
                                            var result;
                                            try {
                                                result = $scope.options.parserFn(str);
                                            } catch (e) {
                                                return str;
                                            }
                                            return result;
                                        }

                                        var response = parseJSON(this.httpRequest.responseText);
                                        this.deferred.resolve(response, this.files);

                                        $scope.finishedUploading();

                                        $angular.forEach(this.files, function forEach(model) {

                                            // Advance the status of the file to that of an uploaded file.
                                            model.setType($scope.FILE_TYPES.UPLOADED);

                                        });

                                        $rootScope.$broadcast('$dropletSuccess', response, this.files);

                                    }.bind(this));

                                    return;

                                }

                                // Error was thrown instead.
                                this.httpRequest.upload.onerror();

                            }

                        }.bind(this);

                    },

                    error: function error() {

                        this.httpRequest.upload.onerror = function onError() {

                            $scope.$apply(function apply() {

                                $scope.finishedUploading();
                                $scope.isError = true;

                                var response = $scope.options.parserFn(this.httpRequest.responseText);
                                $rootScope.$broadcast('$dropletError', response);
                                this.deferred.reject(response);

                            }.bind(this));

                        }.bind(this);

                    },

                    progress: function progress() {

                        var requestLength = $scope.getRequestLength(this.files);

                        this.httpRequest.upload.onprogress = function onProgress(event) {

                            $scope.$apply(function apply() {

                                if (event.lengthComputable) {

                                    // Update the progress object.
                                    $scope.requestProgress.percent = Math.round((event.loaded / requestLength) * 100);
                                    $scope.requestProgress.loaded  = event.loaded;
                                    $scope.requestProgress.total   = requestLength;

                                }

                            });

                        };

                    }

                };

                (function createModelBlueprint() {

                    $scope.DropletModel = function DropletModel() {};

                    $scope.DropletModel.prototype = {

                        load: function load(file) {

                            if (!(file instanceof $window.File) && !(file instanceof $window.Blob)) {
                                $scope.throwException('Loaded files must be an instance of the "File" or "Blob" objects');
                            }

                            this.file      = file;
                            this.date      = new $window.Date();
                            this.mimeType  = file.type;
                            this.extension = $scope.getExtension(file);

                            // File has been added!
                            $rootScope.$broadcast('$dropletFileAdded', this);

                        },

                        deleteFile: function deleteFile() {

                            this.setType($scope.FILE_TYPES.DELETED);

                            // File has been deleted!
                            $rootScope.$broadcast('$dropletFileDeleted', this);

                        },

                        setType: function setType(type) {
                            this.type = type;
                        },

                        isImage: function isImage() {
                            return !!this.file.type.match(/^image\//i);
                        }

                    };

                })();


                $scope.finishedUploading = function finishedUploading() {

                    $scope.progress    = { percent: 0, total: 0, loaded: 0 };
                    $scope.isUploading = false;

                };

                $scope.forEachFile = function forEachFile(type, callbackFn) {

                    $angular.forEach($scope.filterFiles(type || $scope.FILE_TYPES.VALID), function forEach(model) {
                        callbackFn(model);
                    });

                };

                $scope.addFile = function addFile(file, type) {

                    // If the developer didn't specify the type then we'll assume it's a valid file
                    // that they're adding.
                    type = type || $scope.FILE_TYPES.VALID;

                    // Create the model and then register the file.
                    var model = new $scope.DropletModel();
                    model.setType(type);

                    $scope.files.push(model);
                    model.load(file); //will broadcast the event once the model is complete
                    return model;

                };

                $scope.filterFiles = function filterFiles(type) {

                    return $scope.files.filter(function filter(file) {
                        return type & file.type;
                    });

                };

                $scope.getExtension = function getExtension(file) {

	                var str, separator;

	                if ( typeof file.name !== 'undefined' ) {
		                str = file.name;
		                separator = '.';
	                } else {
		                str = file.type;
		                separator = '/';
	                }

	                if (str.indexOf(separator) === -1) {
		                // Filename doesn't actually have an extension.
		                return '';
	                }

	                return str.split(separator).pop().trim().toLowerCase();

                };

                $scope.traverseFiles = function traverseFiles(files) {

                    for (var index = 0, numFiles = files.length; index < numFiles; index++) {

                        var file      = files[index],
                            extension = $scope.getExtension(file),
                            type      = $scope.FILE_TYPES.VALID,
                            maximum   = $scope.options.maximumValidFiles || Infinity,
                            current   = $scope.filterFiles($scope.FILE_TYPES.VALID).length;

                        if (!$scope.isValidExtension(extension) || current >= maximum) {

                            // Invalid extension which we must reject!
                            type = $scope.FILE_TYPES.INVALID;


                        }

                        // Finally we'll register the file using the type that has been deduced.
                        $scope.addFile(file, type);

                    }

                };

                $scope.uploadFiles = function uploadFiles() {

                    // Reset...
                    $scope.isError = false;

                    var httpRequest   = new $window.XMLHttpRequest(),
                        formData      = new $window.FormData(),
                        queuedFiles   = $scope.filterFiles($scope.FILE_TYPES.VALID),
                        fileProperty  = $scope.options.useArray ? 'file[]' : 'file',
                        requestLength = $scope.getRequestLength(queuedFiles),
                        deferred      = $q.defer();

                    // Initiate the HTTP request.
                    httpRequest.open('post', $scope.options.requestUrl, true);

                    /**
                     * @method appendCustomData
                     * @return {void}
                     */
                    (function appendCustomData() {

                        if (!$scope.options.disableXFileSize) {

                            // Setup the file size of the request.
                            httpRequest.setRequestHeader('X-File-Size', requestLength);

                        }

                        // ...And any other additional HTTP request headers, and POST data.
                        $scope.addRequestHeaders(httpRequest);
                        $scope.addPostData(formData);

                    })();

                    /**
                     * @method attachEventListeners
                     * @return {void}
                     */
                    (function attachEventListeners() {

                        // Define the files property so that each listener has the same interface.
                        $scope.listeners.files       = queuedFiles;
                        $scope.listeners.deferred    = deferred;
                        $scope.listeners.httpRequest = httpRequest;

                        // Configure the event listeners for the impending request.
                        $scope.listeners.progress();
                        $scope.listeners.success();
                        $scope.listeners.error();

                    })();

                    // Iterate all of the valid files to append them to the previously created
                    // `formData` object.
                    $angular.forEach(queuedFiles, function forEach(model) {
                        formData.append(fileProperty, model.file);
                    });

                    // Voila...
                    $scope.isUploading = true;
                    httpRequest.send(formData);
                    return deferred.promise;

                };

                $scope.addRequestHeaders = function addRequestHeaders(httpRequest) {

                    for (var header in $scope.options.requestHeaders) {

                        if ($scope.options.requestHeaders.hasOwnProperty(header)) {
                            httpRequest.setRequestHeader(header, $scope.options.requestHeaders[header]);
                        }

                    }

                    return Object.keys($scope.options.requestHeaders);

                };

                $scope.addPostData = function addPostData(formData) {

                    for (var header in $scope.options.requestPostData) {

                        if ($scope.options.requestPostData.hasOwnProperty(header)) {
                            formData.append(header, $scope.options.requestPostData[header]);
                        }

                    }

                    return Object.keys($scope.options.requestPostData);

                };

                $scope.getRequestLength = function getRequestLength(files) {

                    var allFiles = files || $scope.filterFiles($scope.FILE_TYPES.VALID);

                    // Iterate over all of the files to determine the size of all the specified files.
                    return allFiles.reduce(function reduce(previousValue, currentModel) {
                        return previousValue + currentModel.file.size;
                    }, 0);

                };

                $scope.throwException = function throwException(message) {
                    throw "ngDroplet: " + message + ".";
                };

                (function setupDirectiveInterface() {

                    $scope.interface = {

                        FILE_TYPES: $scope.FILE_TYPES,

                        uploadFiles: $scope.uploadFiles,

                        progress: $scope.requestProgress,

                        useParser: function useParser(parserFn) {

                            if (typeof parserFn !== 'function') {
                                $scope.throwException('Parser function must be typeof "function"');
                            }

                            $scope.options.parserFn = parserFn;

                        },

                        isUploading: function isUploading() {
                            return $scope.isUploading;
                        },

                        isError: function isError() {
                            return $scope.isError;
                        },

                        isReady: function isReady() {
                            return !!$scope.filterFiles($scope.FILE_TYPES.VALID).length;
                        },

                        addFile: $scope.addFile,

                        traverseFiles: $scope.traverseFiles,

                        disableXFileSize: function disableXFileSize() {
                            $scope.options.disableXFileSize = true;
                        },

                        useArray: function useArray(value) {
                            $scope.options.useArray = !!value;
                        },

                        setRequestUrl: function setRequestUrl(url) {
                            $scope.options.requestUrl = url;
                        },

                        setRequestHeaders: function setRequestHeaders(headers) {
                            $scope.options.requestHeaders = headers;
                        },

                        setPostData: function setPostData(data) {
                            $scope.options.requestPostData = data;
                        },

                        getFiles: function getFiles(type) {

                            if (type) {

                                // Apply any necessary filters if a bitwise value has been supplied.
                                return $scope.filterFiles(type);

                            }

                            // Otherwise we'll yield the entire set of files.
                            return $scope.files;

                        },

                        getFilesImage: function getFiles(type) {

                            if (type) {

                                // Apply any necessary filters if a bitwise value has been supplied.
                                var filesFilter = $scope.filterFiles(type);
                                return filesFilter;

                            }

                            // Otherwise we'll yield the entire set of files.
                            return $scope.files;

                        },

                        allowedExtensions: function allowedExtensions(extensions) {

                            if (!$angular.isArray(extensions)) {

                                // Developer didn't pass an array of extensions!
                                $scope.throwException('Extensions must be an array');

                            }

                            $scope.options.extensions = extensions;

                        },

                        defineHTTPSuccess: function defineHTTPSuccess(statuses) {

                            if (!$angular.isArray(statuses)) {

                                // Developer didn't pass an array of extensions!
                                $scope.throwException('Status list must be an array');

                            }

                            $scope.options.statuses.success = statuses;

                        }

                    };

                    $timeout(function timeout() {

                        // Emit the event to notify any listening scopes that the interface has been attached
                        // for communicating with the directive.
                        $rootScope.$broadcast('$dropletReady', $scope.interface);

                    });

                })();

            }],

            /**
             * @method link
             * @param scope {Object}
             * @param element {Object}
             * @return {void}
             */
            link: function link(scope, element) {

                /**
                 * @method _preventDefault
                 * @param event {Object}
                 * @return {void}
                 * @private
                 */
                var _preventDefault = function _preventDefault(event) {

                    event = scope.getEvent(event);

                    // Remove all of the possible class names.
                    element.removeClass('event-dragleave');
                    element.removeClass('event-dragenter');
                    element.removeClass('event-dragover');
                    element.removeClass('event-drop');

                    // ...And then add the current class name.
                    element.addClass('event-' + event.type);

                    event.preventDefault();
                    event.stopPropagation();

                };

                // Events that merely need their default behaviour quelling.
                element.bind('dragover dragenter dragleave', _preventDefault);

                // Bind to the "drop" event which will contain the items the user dropped
                // onto the element.
                element.bind('drop', function onDrop(event) {

                    _preventDefault(event);

                    scope.$apply(function apply() {

                        event = scope.getEvent(event);
                        scope.traverseFiles(event.dataTransfer.files);

                    });

                });

            }

        }

    }]).directive('dropletPreview', ['$window', function DropletPreviewDirective($window) {

        return {

            /**
             * @property scope
             * @type {Object}
             */
            scope: {
                model: '=ngModel'
            },

            /**
             * @property restrict
             * @type {String}
             */
            restrict: 'EA',

            /**
             * @property replace
             * @type {Boolean}
             */
            replace: true,

            /**
             * @property template
             * @type {String}
             */
            template: '<img ng-show="model.isImage()" style="background-image: url({{imageData}})" class="droplet-preview" />',

            /**
             * @method link
             * @param scope {Object}
             * @return {void}
             */
            link: function link(scope) {

                /**
                 * @property imageData
                 * @type {String}
                 */
                scope.imageData = '';

                // Instantiate the file reader for reading the image data.
                var fileReader = new $window.FileReader();

                /**
                 * @method onload
                 * @return {void}
                 */
                fileReader.onload = function onload(event) {

                    scope.$apply(function apply() {

                        // Voila! Define the image data.
                        scope.imageData = event.target.result;

                    });

                };

                if (scope.model.isImage()) {

                    // Initialise the loading of the image into the file reader.
                    fileReader.readAsDataURL(scope.model.file);

                }


            }

        }

    }]);

    /**
     * @method createInputElements
     * @return {void}
     */
    (function createInputElements() {

        /**
         * @method createDirective
         * @return {void}
         */
        var createDirective = function createDirective(name, htmlMarkup) {

            module.directive(name, function DropletUploadSingleDirective() {

                return {

                    /**
                     * @property restrict
                     * @type {String}
                     */
                    restrict: 'EA',

                    /**
                     * @property require
                     * @type {String}
                     */
                    require: 'ngModel',

                    /**
                     * @property replace
                     * @type {Boolean}
                     */
                    replace: true,

                    /**
                     * @property processFileList
                     * @type {String}
                     */
                    template: htmlMarkup,

                    /**
                     * @property scope
                     * @type {Object}
                     */
                    scope: {
                        interface: '=ngModel'
                    },

                    /**
                     * @method link
                     * @param scope {Object}
                     * @param element {Object}
                     * @return {void}
                     */
                    link: function link(scope, element) {

                        // Subscribe to the "change" event.
                        element.bind('change', function onChange() {

                            scope.$apply(function apply() {
                                scope.interface.traverseFiles(element[0].files);
                            });

                        });

                        // Reset the `value` of the element each time a user clicks.
                        element.bind('click', function onClick() {
                            this.value = null;
                        });

                    }

                }

            });

        };

        // Create the actual input elements.
        createDirective('dropletUploadSingle', '<input class="droplet-upload droplet-single" type="file" />');
        createDirective('dropletUploadMultiple', '<input class="droplet-upload droplet-multiple" type="file" multiple="multiple" />');

    })();

})(window.angular);
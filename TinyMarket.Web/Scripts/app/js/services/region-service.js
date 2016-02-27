//Service style, probably the simplest one
myApp.service('regionService', ['$http', '$q', function ($http, $q) {
    var serviceBase = '/api/regions';

    this.getAllRegions = function () {
        var deferred = $q.defer();
        $http.get(serviceBase + "/GetAllRegions").success(function (data, status, headers, config) {

            var results = [];

            results.data = data;
            results.headers = headers();
            results.status = status;
            results.config = config;

            deferred.resolve(results);
        }).error(deferred.reject);

        return deferred.promise;
    };
}]);
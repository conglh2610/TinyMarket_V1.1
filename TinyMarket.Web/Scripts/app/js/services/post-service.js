//Service style, probably the simplest one
myApp.service('postService', ['$http', '$q', function ($http, $q) {
    var serviceBase = '/api/posts';

    this.searchPosts= function () {
        var deferred = $q.defer();
        $http.get(serviceBase + "/SearchPosts").success(function (data, status, headers, config) {

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
//Service style, probably the simplest one
myApp.service('categoryService', ['$http', '$q', function ($http, $q) {
    var serviceBase = '/api/categorydetail';

    this.getAllCategories = function () {
        var deferred = $q.defer();
        $http.get(serviceBase + "/GetAllCategoryDetails").success(function (data, status, headers, config) {

            var results = [];

            results.data = data;
            results.headers = headers();
            results.status = status;
            results.config = config;

            deferred.resolve(results);
        }).error(deferred.reject);

        return deferred.promise;
    };

    this.categoryAddAndDisableParent = function (categoryData) {
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
}]);
require.config({
    baseUrl: 'app',
    urlArgs: 'v=1.0'
});

require(
    [
        'app'
        ,'services/routeResolver'
        , 'services/config'
    ],
    function () {
        angular.bootstrap(document, ['myApp']);
    });

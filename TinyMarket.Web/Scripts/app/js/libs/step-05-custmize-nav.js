myApp.controller('wizardStepCustmizeNavCtrl', ['$scope', function ($scope) {

    $scope.steps = [];

    window.angular.forEach($scope.$context.steps, function (step, id) {
        if (id !== $scope.$context.currentStepId) {
            $scope.steps.push(step);
        }
    });

    $scope.$context.navigation.buttons = [
      {
          text: 'Go First',
          stepFn: function () {
              return $scope.steps[0].id;
          }
      },
      {
          text: 'Go Last',
          stepFn: function () {
              return $scope.steps[$scope.steps.length - 1].id;
          }
      },
      {
          text: 'Go Dynamic',
          stepFn: function () {
              return $scope.targetStepId;
          }
      },
    ];


}]);

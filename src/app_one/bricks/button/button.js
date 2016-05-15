(function () {
    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/
    angular.module('brx')
        .directive('cButton', cButton);


    /************************************/
    /*           IMPLEMENTATION         */
    /************************************/
    // cButton.$inject = []
    function cButton () {
        return {
            restrict: 'E',
            template: '<button ng-transclude></button>',
            // scope: {},
            replace: true,
            transclude: true,
            controller: controller
        };
    }

    controller.$inject = ['$scope']
    function controller ($scope) {
        $scope.clicks = 0;
    }

})();
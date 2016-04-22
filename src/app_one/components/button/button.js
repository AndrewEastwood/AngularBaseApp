(function () {
    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/
    angular.module('com.button', [])
        .directive('cButton', cButton);


    /************************************/
    /*           IMPLEMENTATION         */
    /************************************/
    cButton.$inject = ['globalGetStaticRootToApp']
    function cButton (globalGetStaticRootToApp) {
        return {
            restrict: 'E',
            templateUrl: globalGetStaticRootToApp('com/button/button.html'),
            scope: {},
            replace: true,
            controller: controller
        };
    }

    controller.$inject = ['$scope']
    function controller ($scope) {
        $scope.clicks = 0;
    }

})();
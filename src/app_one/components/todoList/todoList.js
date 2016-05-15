(function () {
    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/
    angular.module('com')
        .directive('todoList', todoList);


    /************************************/
    /*           IMPLEMENTATION         */
    /************************************/
    todoList.$inject = ['globalGetStaticRootToApp']
    function todoList (globalGetStaticRootToApp) {
        return {
            restrict: 'E',
            templateUrl: globalGetStaticRootToApp('components/todoList/todoList.html'),
            scope: {
                heading: '@'
            },
            // replace: true,
            controller: controller
        };
    }

    controller.$inject = ['$scope']
    function controller ($scope) {
        $scope.add = add;
        $scope.items = [];
        $scope.newItem = null;

        function add () {
            if (!!!$scope.newItem) return false;
            debugger;
            $scope.items.push({
                done: false,
                name: $scope.newItem
            });
            $scope.newItem = null;
        }
    }

})();
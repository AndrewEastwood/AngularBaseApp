(function () {
    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/
    angular.module('com')
        .controller('todoListController', controller)
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
            controller: 'todoListController'
        };
    }

    controller.$inject = ['$scope']
    function controller ($scope) {
        $scope.total = total;
        $scope.add = add;
        $scope.items = [];
        $scope.newItem = null;

        function total () {
            return $scope.items.length;
        }

        function add () {
            if (!!!$scope.newItem) return false;
            $scope.items.push({
                done: false,
                name: $scope.newItem
            });
            $scope.newItem = null;
        }
    }

})();
(function () {
    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/
    angular.module('com.todoList', ['brx.button'])
        .directive('todoList', todoList);


    /************************************/
    /*           IMPLEMENTATION         */
    /************************************/
    todoList.$inject = ['globalGetStaticRootToApp']
    function todoList (globalGetStaticRootToApp) {
        return {
            restrict: 'E',
            templateUrl: globalGetStaticRootToApp('com/todoList/todoList.html'),
            scope: {
                title: '='
            },
            replace: true,
            controller: controller
        };
    }

    controller.$inject = ['$scope']
    function controller ($scope) {
        $scope.add = add;
        $scope.items = [];
        $scope.newItem = null;

        function add () {
            $scope.items.push({
                done: false,
                name: $scope.newItem
            });
            $scope.newItem = null;
        }
    }

})();
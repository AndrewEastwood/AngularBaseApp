(function() {
    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/
    angular.module('pages')
        .config(viewConfig);


    /************************************/
    /*           IMPLEMENTATION         */
    /************************************/
    viewConfig.$inject = ['$stateProvider', 'globalGetStaticRootToApp'];
    function viewConfig ($stateProvider, globalGetStaticRootToApp) {
        var tpl = globalGetStaticRootToApp('pages/home/home.html');
        // debugger;
        $stateProvider.state('home', {
            url: '/',
            data: {
                pageTitle: 'Home Page'
            },
            views: {
                'content@': {
                    templateUrl: globalGetStaticRootToApp('pages/home/home.html'),
                    controller: viewHomeController,
                    controllerAs: 'view'
                }
            }
        });
    }

    viewHomeController.$inject = [
        '$scope'
    ];
    function viewHomeController ($scope) {
        // body...
        $scope.name = '';
        $scope.email = '';
    }

})();
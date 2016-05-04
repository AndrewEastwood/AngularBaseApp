(function() {
    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/
    angular.module('pages.home', [])
        .config(viewConfig);


    /************************************/
    /*           IMPLEMENTATION         */
    /************************************/
    viewConfig.$inject = ['$stateProvider', 'globalGetStaticRootToApp'];
    function viewConfig ($stateProvider, globalGetStaticRootToApp) {
        $stateProvider.state('home', {
            url: '/',
            data: {
                pageTitle: 'Home Page'
            },
            views: {
                'content@': {
                    templateUrl: globalGetStaticRootToApp('views/home/home.html'),
                    controller: viewHomeController,
                    controllerAs: 'view'
                }
            }
        });
        $stateProvider.state('home', {
            url: '/home',
            data: {
                pageTitle: 'Home Page'
            },
            views: {
                'content@': {
                    templateUrl: globalGetStaticRootToApp('views/home/home.html'),
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
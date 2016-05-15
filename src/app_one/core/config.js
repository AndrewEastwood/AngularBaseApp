(function() {
    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/
    angular.module('app')
        .config(config);

    /************************************/
    /*           IMPLEMENTATION         */
    /************************************/

    config.$inject = ['$urlRouterProvider'];
    function config ($urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
    }

})();
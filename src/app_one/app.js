(function() {
    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/
    angular.module('app', [].concat.apply([], [
        // External Deps
        externalDeps,
        // App Core
        appCore,
        // Services
        appServices,
        // Views
        appViews,
        // Components
        appComponents
    ]))
    .run(run);
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['app']);
    });

    /************************************/
    /*           IMPLEMENTATION         */
    /************************************/
    var externalDeps = [
        'ngResource',
        'ngTouch',
        'ui.bootstrap',
        'ui.router',
        'ngAria',
        'ngSanitize',
        'toastr',
        'LocalStorageModule',
        'ipCookie',
        'ngIdle'
    ];
    var appCore = [
        'settings',
        'resolvers',
        'filters'
    ];
    var appServices = ['service.api'];
    var appViews = ['view.home'];
    var appComponents = ['com.button'];

    run.$inject = ['$window', '$state', '$stateParams', '$rootScope'];
    function run ($window, $state, $stateParams, $rootScope) {

    }

})();
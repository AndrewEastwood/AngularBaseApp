(function() {
    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/
    angular.module('api', []);
    angular.module('pages', []);
    angular.module('com', []);
    angular.module('brx', []);
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
    var appServices = ['api'];
    var appViews = ['pages'];
    var appComponents = ['com.todoList'];

    run.$inject = ['$window', '$state', '$stateParams', '$rootScope'];
    function run ($window, $state, $stateParams, $rootScope) {

    }

})();
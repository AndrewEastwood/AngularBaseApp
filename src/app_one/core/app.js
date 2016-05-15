(function() {
    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/
    var externalDeps = [
        'ngResource',
        'ngTouch',
        'ui.bootstrap',
        'ui.router',
        'ngAria',
        'ngSanitize',
        'ngMaterial'
    ];
    var appCore = [
        'settings',
        'resolvers',
        'filters',
        'interceptors'
    ];
    var mods = ['api', 'pages', 'com', 'brx'];
    for (var k in mods) {
        angular.module(mods[k], []);
    }
    angular.module('app', [].concat.apply([], [
        // External Deps
        externalDeps,
        // App Core
        appCore,
        // App Deps
        mods
    ]))
    .run(run);
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['app']);
    });

    /************************************/
    /*           IMPLEMENTATION         */
    /************************************/
    // var appServices = ['api'];
    // var appViews = ['pages'];
    // var appComponents = ['com.todoList'];

    run.$inject = ['$window', '$state', '$stateParams', '$rootScope'];
    function run ($window, $state, $stateParams, $rootScope) {

    }



})();
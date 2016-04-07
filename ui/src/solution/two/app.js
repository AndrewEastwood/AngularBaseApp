(function() {
    'use strict';

    angular.module('app', [
        'ngResource',
        'ngTouch',
        'ui.bootstrap',
        'ui.router',
        'ngAria',
        'ngSanitize',
        'toastr',
        'LocalStorageModule',
        'ipCookie',
        'ngIdle',

        // App Core
        'app.settings',
        'app.resolvers',
        'app.filters',

        // Service

        // Views

        // Components
    ])

    .run(['$window', '$state', '$stateParams', '$rootScope',
        function($window, $state, $stateParams, $rootScope) {

        }
    ]);

    angular.element(document).ready(function() {
        angular.bootstrap(document, [appModule]);
    });

})();

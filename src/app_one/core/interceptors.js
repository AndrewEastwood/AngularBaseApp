(function() {
    'use strict';

    angular.module('interceptors', [])
        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push(appInterceptor);
        }]);

        appInterceptor.$inject = [];
        function appInterceptor() {
            return {
                request: function(config) {
                    return config;
                },
                responseError: function(rejection) {
                    return rejection;
                }
            };
        }

})();
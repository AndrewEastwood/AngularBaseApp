(function () {

    'use strict';
    angular.module('settings', [])
        .constant('globalIsDebugMode', window.CONFIG.DEBUG)
        .constant('globalGetStaticRoot', function (path) {
            if (!window.CONFIG) {
                throw 'Global CONFIG is not defined';
            }
            if (path) {
                if (path[0] === '/') {
                    path = path.substr(1);
                }
                return window.CONFIG.STATICDIR + path;
            }
            return window.CONFIG.STATICDIR;
        })
        .constant('globalGetStaticRootToApp', function (path) {
            if (!window.CONFIG) {
                throw 'Global CONFIG is not defined';
            }
            if (path) {
                if (path[0] === '/') {
                    path = path.substr(1);
                }
                return window.CONFIG.SOLUTIONDIR + window.CONFIG.APP + '/' + path;
            }
            return window.CONFIG.SOLUTIONDIR;
        })
        .constant('globalGetApiRoot', function (path) {
            if (!window.CONFIG) {
                throw 'Global CONFIG is not defined';
            }
            if (path) {
                if (path[0] === '/') {
                    path = path.substr(1);
                }
                return window.CONFIG.apiUrl + path;
            }
            return window.CONFIG.apiUrl;
        })
        .provider('appSettings', [function () {
            var appConfig = window.CONFIG;

            this.$get = function () {
                return {
                    getConfig: getConfig
                };
            };

            function getConfig () {
                return appConfig;
            }

        }]);

})();

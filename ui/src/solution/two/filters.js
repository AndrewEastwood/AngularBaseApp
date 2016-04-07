(function () {

    'use strict';

    angular.module('filters', ['app.settings'])
        .filter('appendStaticRoot', ['globalGetStaticRoot', function (globalGetStaticRoot) {
            return globalGetStaticRoot;
        }])
        .filter('prettyJSON', function () {
            function prettyJsonPrint (json) {
                return JSON ? JSON.stringify(json, null, '    ') : 'not supported';
            }
            return prettyJsonPrint;
        });
})();
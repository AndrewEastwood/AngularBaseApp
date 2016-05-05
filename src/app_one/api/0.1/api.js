(function() {
    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/

    angular.module('api')
        .provider('AppApiConfig_0.1', AppApiConfig)
        .service('AppApi_0.1', apiService);

    /************************************/
    /*           IMPLEMENTATION         */
    /************************************/

    function AppApiConfig () {
        var apiUrl;
        this.setBaseApiUrl = function(url) {
            apiUrl = url;
        };
        this.$get = ['appSettings', function(appSettings) {
            var cfg = appSettings.getConfig();
            return {
                // functions
                getBaseApiUrl: getBaseApiUrl,
                createApiUrl: createApiUrl,
                // urls
                getSomeData: cfg.apiUrl + 'testdata',
            };
        }];
        function getBaseApiUrl () {
            return apiUrl;
        }
        function createApiUrl (path) {
            return apiUrl + path;
        }
    }

    apiService.$inject = ['AppApiConfig', '$http'];
    function apiService () {
        this.getReports = function() {
            return $http.get(AppApiConfig.getSomeData);
        };
    }

})();
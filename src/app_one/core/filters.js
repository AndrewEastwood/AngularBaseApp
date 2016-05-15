(function () {

    'use strict';

    /************************************/
    /*             NG Setup             */
    /************************************/

    angular.module('filters', ['settings'])
        .filter('appendStaticRoot', appendStaticRoot)
        .filter('prettyJSON', prettyJSON);

    /************************************/
    /*           IMPLEMENTATION         */
    /************************************/

    appendStaticRoot.$inject = ['globalGetStaticRoot'];
    function appendStaticRoot (globalGetStaticRoot) {
        return globalGetStaticRoot;
    }

    function prettyJSON () {
        function prettyJsonPrint (json) {
            return JSON ? JSON.stringify(json, null, '    ') : 'not supported';
        }
        return prettyJsonPrint;
    }

})();
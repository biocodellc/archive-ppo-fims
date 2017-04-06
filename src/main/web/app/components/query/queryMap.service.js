(function () {
    'use strict';

    angular.module('fims.query')
        .factory('queryMap', queryMap);

    queryMap.$inject = ['Map'];

    function queryMap(Map) {

        function QueryMap(latColumn, lngColumn) {
            Map.call(this, latColumn, lngColumn);
        }

        QueryMap.prototype = Object.create(Map.prototype);

        QueryMap.prototype.setMarkers = function (data) {
            Map.prototype.setMarkers.call(this, data, generatePopupContent);
        };

        return new QueryMap('Latitude', 'Longitude');

        function generatePopupContent(resource) {
            return "<strong>GUID</strong>:  " + resource.bcid + "<br>";
            // "<strong>Genus</strong>:  " + resource.genus + "<br>" +
            // "<strong>Species</strong>:  " + resource.species + "<br>" +
            // "<strong>Locality, Country</strong>:  " + resource.locality + ", " + resource.country + "<br>" +
        }
    }
})();
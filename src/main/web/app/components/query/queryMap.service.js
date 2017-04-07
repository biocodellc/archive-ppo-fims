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
            return "<strong>Genus</strong>:  " + resource.Genus + "<br>" +
                "<strong>Species</strong>:  " + resource.Species + "<br>" +
                "<strong>Date</strong>:  " + resource.Observation_Date + "<br>";
        }
    }
})();
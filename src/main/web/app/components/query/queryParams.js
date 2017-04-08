(function () {
    'use strict';

    angular.module('fims.query')
        .factory('queryParams', queryParams);

    queryParams.$inject = ['QueryBuilder'];

    function queryParams(QueryBuilder) {
        var defaultParams = {
            fromYear: null,
            toYear: null,
            fromDay: null,
            toDay: null,
            genus: null
        };

        var params = {
            traits: [],
            build: buildQuery,
            clear: clear
        };

        activate();

        return params;

        function activate() {
            clear();
        }

        function buildQuery(source) {
            var builder = new QueryBuilder();

            angular.forEach(params.traits, function (t) {
                builder.add("+types:\"" + t + "\"");
            });

            if (params.fromYear) {
                builder.add("+Observation_Date:>=" + params.fromYear + "\\|\\|\\/y");
            }

            if (params.toYear) {
                builder.add("+Observation_Date:<=" + params.toYear + "\\|\\|\\/y]");
            }

            if (params.fromDay) {
                builder.add("+Day_of_Year:>=" + params.fromDay);
            }

            if (params.toDay) {
                builder.add("+Day_of_Year:<=" + params.toDay);
            }

            if (params.genus) {
                builder.add("+Genus:" + params.genus);
            }

            builder.setSource(source);
            return builder.build();

        }

        function clear() {
            angular.extend(params, defaultParams);
            params.traits = [];
        }

    }

})();
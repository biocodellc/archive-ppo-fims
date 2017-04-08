(function () {
    'use strict';

    angular.module('fims.query')
        .factory('queryParams', queryParams);

    queryParams.$inject = ['QueryBuilder'];

    function queryParams(QueryBuilder) {
        var defaultParams = {
            vernacular: null,
            yearCollected: null,
            fromDay: null,
            toDay: null,
            genus: null,
            queryString: null
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


            if (params.queryString) {
                builder.add(params.queryString);
            }

            if (params.vernacular) {
                builder.add("+Common_Name:" + params.vernacular);
            }

            if (params.yearCollected) {
                builder.add("+Observation_Date:[" + params.yearCollected + "||/y TO " + params.yearCollected + "||/y]")
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
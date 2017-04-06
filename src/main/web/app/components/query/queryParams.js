(function () {
    'use strict';

    angular.module('fims.query')
        .factory('queryParams', queryParams);

    queryParams.$inject = ['QueryBuilder'];

    function queryParams(QueryBuilder) {
        var defaultParams = {
            vernacular: null,
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
                builder.add("+Phenophase_Description:" + t);
            });


            if (params.queryString) {
                builder.add(params.queryString);
            }

            if (params.vernacular && params.vernacular.trim() !== "") {
                builder.add("+Common_Name:" + params.vernacular);
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
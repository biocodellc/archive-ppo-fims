(function () {
    'use strict';

    angular.module('fims.query')
        .controller('QueryFormController', QueryFormController);

    QueryFormController.$inject = ['queryParams', 'queryService', 'queryResults', 'queryMap',
        'usSpinnerService', 'exception'];

    function QueryFormController(queryParams, queryService, queryResults, queryMap, usSpinnerService, exception) {
        var vm = this;

        // select lists
        vm.traits = {
            "plant structures present": "PPO:0003000",
            "abscised plant structures present": "PPO:0003001",
            "leaves present": "PPO:0003002",
            "expanding leaves present": "PPO:0003003",
            "mature leaves present": "PPO:0003004",
            "senescent leaves present": "PPO:0003005",
            "breaking buds present": "PPO:0003006",
            "abscised leaves present": "PPO:0003007",
            "new above-ground shoot-borne shoot systems present": "PPO:0003008",
            "flowers present": "PPO:0003009",
            "flower heads present": "PPO:0003010",
            "open flowers present": "PPO:0003011",
            "pollen-releasing flowers present": "PPO:0003012",
            "fruits present": "PPO:0003013",
            "ripening fruits present": "PPO:0003014",
            "abscised fruits or seeds present": "PPO:0003015",
            "cones present": "PPO:0003016",
            "pollen cones present": "PPO:0003017",
            "open pollen cones present": "PPO:0003018",
            "pollen-releasing pollen cones present": "PPO:0003019",
            "seed cones present": "PPO:0003020",
            "unripe seed cones present": "PPO:0003021",
            "ripening seed cones present": "PPO:0003022",
            "leaves absent": "PPO:0003043",
            "mature leaves absent": "PPO:0003044",
            "senescent leaves absent": "PPO:0003045",
            "breaking buds absent": "PPO:0003046",
            "abscised leaves absent": "PPO:0003047",
            "new above-ground shoot-borne shoot systems absent": "PPO:0003048",
            "flowers absent": "PPO:0003049",
            "flower heads absent": "PPO:0003050",
            "open flowers absent": "PPO:0003051",
            "pollen-releasing flowers absent": "PPO:0003052",
            "fruits absent": "PPO:0003053",
            "ripening fruits absent": "PPO:0003054",
            "abscised fruits or seeds absent": "PPO:0003055",
            "cones absent": "PPO:0003056",
            "pollen cones absent": "PPO:0003057",
            "open pollen cones absent": "PPO:0003058",
            "pollen-releasing pollen cones absent": "PPO:0003059",
            "seed cones absent": "PPO:0003060",
            "unripe seed cones absent": "PPO:0003061",
            "ripening seed cones absent": "PPO:0003062",
            "abscised cones or seeds absent": "PPO:0003063",
        };

        vm.vernaculars = [
            'common sunflower',
            'dwarf birch',
            'paper birch',
            'river birch',
            'sweet birch',
            'yellow birch'
        ];


        // view toggles
        vm.moreSearchOptions = false;
        vm.showMap = true;

        vm.params = queryParams;

        vm.queryJson = queryJson;

        function queryJson() {
            usSpinnerService.spin('query-spinner');

            queryService.queryJson(queryParams.build(), 0, 10000)
                .then(queryJsonSuccess)
                .catch(queryJsonFailed)
                .finally(queryJsonFinally);

            function queryJsonSuccess(data) {
                queryResults.update(data);
                queryMap.setMarkers(queryResults.data);
            }

            function queryJsonFailed(response) {
                exception.catcher("Failed to load query results")(response);
                vm.queryResults.isSet = false;
            }

            function queryJsonFinally() {
                usSpinnerService.stop('query-spinner');
            }

        }
    }
})();
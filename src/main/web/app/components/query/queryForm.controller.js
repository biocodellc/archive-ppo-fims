(function () {
    'use strict';

    angular.module('fims.query')
        .controller('QueryFormController', QueryFormController);

    QueryFormController.$inject = ['queryParams', 'queryService', 'queryResults', 'queryMap',
        'usSpinnerService', 'exception'];

    function QueryFormController(queryParams, queryService, queryResults, queryMap, usSpinnerService, exception) {
        var SOURCE = ["latitude", "longitude", "startDayOfYear", "year", "genus", "specificEpithet", "source"];

        var vm = this;

        // select lists
        vm.traits = {
            'plant phenological trait': 'http://purl.obolibrary.org/obo/PPO:0002001',
            'plant structure presence': 'http://purl.obolibrary.org/obo/PPO:0002002',
            'abscised plant structure presence': 'http://purl.obolibrary.org/obo/PPO:0002003',
            'leaf presence': 'http://purl.obolibrary.org/obo/PPO:0002004',
            'expanding leaf presence': 'http://purl.obolibrary.org/obo/PPO:0002005',
            'mature leaf presence': 'http://purl.obolibrary.org/obo/PPO:0002006',
            'senescent leaf presence': 'http://purl.obolibrary.org/obo/PPO:0002007',
            'breaking bud presence': 'http://purl.obolibrary.org/obo/PPO:0002008',
            'abscised leaf presence': 'http://purl.obolibrary.org/obo/PPO:0002009',
            'new above-ground shoot-borne shoot system presence': 'http://purl.obolibrary.org/obo/PPO:0002010',
            'reproductive structure presence': 'http://purl.obolibrary.org/obo/PPO:0002011',
            'flower presence': 'http://purl.obolibrary.org/obo/PPO:0002012',
            'flower head presence': 'http://purl.obolibrary.org/obo/PPO:0002013',
            'open flower presence': 'http://purl.obolibrary.org/obo/PPO:0002014',
            'pollen-releasing flower presence': 'http://purl.obolibrary.org/obo/PPO:0002015',
            'fruit presence': 'http://purl.obolibrary.org/obo/PPO:0002016',
            'ripening fruit presence': 'http://purl.obolibrary.org/obo/PPO:0002017',
            'abscised fruit or seed presence': 'http://purl.obolibrary.org/obo/PPO:0002018',
            'cone presence': 'http://purl.obolibrary.org/obo/PPO:0002019',
            'pollen cone presence': 'http://purl.obolibrary.org/obo/PPO:0002020',
            'open pollen cone presence': 'http://purl.obolibrary.org/obo/PPO:0002021',
            'pollen-releasing pollen cone presence': 'http://purl.obolibrary.org/obo/PPO:0002022',
            'seed cone presence': 'http://purl.obolibrary.org/obo/PPO:0002023',
            'unripe seed cone presence': 'http://purl.obolibrary.org/obo/PPO:0002024',
            'ripening seed cone presence': 'http://purl.obolibrary.org/obo/PPO:0002025',
            'abscised cone or seed presence': 'http://purl.obolibrary.org/obo/PPO:0002026'
        };
            // "plant structures present": "http://purl.obolibrary.org/obo/PPO_0003000",
            // "abscised plant structures present": "http://purl.obolibrary.org/obo/PPO_0003001",
            // "leaves present": "http://purl.obolibrary.org/obo/PPO_0003002",
            // "expanding leaves present": "http://purl.obolibrary.org/obo/PPO_0003003",
            // "mature leaves present": "http://purl.obolibrary.org/obo/PPO_0003004",
            // "senescent leaves present": "http://purl.obolibrary.org/obo/PPO_0003005",
            // "breaking buds present": "http://purl.obolibrary.org/obo/PPO_0003006",
            // "abscised leaves present": "http://purl.obolibrary.org/obo/PPO_0003007",
            // "new above-ground shoot-borne shoot systems present": "http://purl.obolibrary.org/obo/PPO_0003008",
            // "flowers present": "http://purl.obolibrary.org/obo/PPO_0003009",
            // "flower heads present": "http://purl.obolibrary.org/obo/PPO_0003010",
            // "open flowers present": "http://purl.obolibrary.org/obo/PPO_0003011",
            // "pollen-releasing flowers present": "http://purl.obolibrary.org/obo/PPO_0003012",
            // "fruits present": "http://purl.obolibrary.org/obo/PPO_0003013",
            // "ripening fruits present": "http://purl.obolibrary.org/obo/PPO_0003014",
            // "abscised fruits or seeds present": "http://purl.obolibrary.org/obo/PPO_0003015",
            // "cones present": "http://purl.obolibrary.org/obo/PPO_0003016",
            // "pollen cones present": "http://purl.obolibrary.org/obo/PPO_0003017",
            // "open pollen cones present": "http://purl.obolibrary.org/obo/PPO_0003018",
            // "pollen-releasing pollen cones present": "http://purl.obolibrary.org/obo/PPO_0003019",
            // "seed cones present": "http://purl.obolibrary.org/obo/PPO_0003020",
            // "unripe seed cones present": "http://purl.obolibrary.org/obo/PPO_0003021",
            // "ripening seed cones present": "http://purl.obolibrary.org/obo/PPO_0003022",
            // "leaves absent": "http://purl.obolibrary.org/obo/PPO_0003043",
            // "mature leaves absent": "http://purl.obolibrary.org/obo/PPO_0003044",
            // "senescent leaves absent": "http://purl.obolibrary.org/obo/PPO_0003045",
            // "breaking buds absent": "http://purl.obolibrary.org/obo/PPO_0003046",
            // "abscised leaves absent": "http://purl.obolibrary.org/obo/PPO_0003047",
            // "new above-ground shoot-borne shoot systems absent": "http://purl.obolibrary.org/obo/PPO_0003048",
            // "flowers absent": "http://purl.obolibrary.org/obo/PPO_0003049",
            // "flower heads absent": "http://purl.obolibrary.org/obo/PPO_0003050",
            // "open flowers absent": "http://purl.obolibrary.org/obo/PPO_0003051",
            // "pollen-releasing flowers absent": "http://purl.obolibrary.org/obo/PPO_0003052",
            // "fruits absent": "http://purl.obolibrary.org/obo/PPO_0003053",
            // "ripening fruits absent": "http://purl.obolibrary.org/obo/PPO_0003054",
            // "abscised fruits or seeds absent": "http://purl.obolibrary.org/obo/PPO_0003055",
            // "cones absent": "http://purl.obolibrary.org/obo/PPO_0003056",
            // "pollen cones absent": "http://purl.obolibrary.org/obo/PPO_0003057",
            // "open pollen cones absent": "http://purl.obolibrary.org/obo/PPO_0003058",
            // "pollen-releasing pollen cones absent": "http://purl.obolibrary.org/obo/PPO_0003059",
            // "seed cones absent": "http://purl.obolibrary.org/obo/PPO_0003060",
            // "unripe seed cones absent": "http://purl.obolibrary.org/obo/PPO_0003061",
            // "ripening seed cones absent": "http://purl.obolibrary.org/obo/PPO_0003062",
            // "abscised cones or seeds absent": "http://purl.obolibrary.org/obo/PPO_0003063"
        // };

        // view toggles
        vm.showMap = true;

        vm.params = queryParams;

        vm.queryJson = queryJson;

        function queryJson() {
            usSpinnerService.spin('query-spinner');

            queryService.queryJson(queryParams.build(), 0, 10000, SOURCE)
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
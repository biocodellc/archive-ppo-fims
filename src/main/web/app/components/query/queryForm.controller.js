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
          'plant structures present': 'http://purl.obolibrary.org/obo/PPO:0002300',
          'new shoot system present': 'http://purl.obolibrary.org/obo/PPO:0002301',
          'new above-ground shoot-borne shoot systems present': 'http://purl.obolibrary.org/obo/PPO:0002302',
          'new shoot systems emerging from ground present': 'http://purl.obolibrary.org/obo/PPO:0002303',
          'new shoot systems emerging from ground in first growth cycle present': 'http://purl.obolibrary.org/obo/PPO:0002304',
          'seedling present': 'http://purl.obolibrary.org/obo/PPO:0002305',
          'new shoot systems emerging from ground in later growth cycle present': 'http://purl.obolibrary.org/obo/PPO:0002306',
          'leaf buds present': 'http://purl.obolibrary.org/obo/PPO:0002307',
          'dormant leaf buds present': 'http://purl.obolibrary.org/obo/PPO:0002308',
          'non-dormant leaf buds present': 'http://purl.obolibrary.org/obo/PPO:0002309',
          'swelling leaf buds present': 'http://purl.obolibrary.org/obo/PPO:0002310',
          'breaking leaf buds present': 'http://purl.obolibrary.org/obo/PPO:0002311',
          'vascular leaves present': 'http://purl.obolibrary.org/obo/PPO:0002312',
          'true leaves present': 'http://purl.obolibrary.org/obo/PPO:0002313',
          'unfolding true leaves present': 'http://purl.obolibrary.org/obo/PPO:0002314',
          'unfolded true leaves present': 'http://purl.obolibrary.org/obo/PPO:0002315',
          'non-senescing unfolded true leaves present': 'http://purl.obolibrary.org/obo/PPO:0002316',
          'senescing true leaves present': 'http://purl.obolibrary.org/obo/PPO:0002317',
          'immature unfolded true leaves present': 'http://purl.obolibrary.org/obo/PPO:0002318',
          'mature true leaves present': 'http://purl.obolibrary.org/obo/PPO:0002319',
          'expanding unfolded true leaves present': 'http://purl.obolibrary.org/obo/PPO:0002320',
          'expanded immature true leaves present': 'http://purl.obolibrary.org/obo/PPO:0002321',
          'expanding true leaves present': 'http://purl.obolibrary.org/obo/PPO:0002322',
          'reproductive structures present': 'http://purl.obolibrary.org/obo/PPO:0002323',
          'floral structures present': 'http://purl.obolibrary.org/obo/PPO:0002324',
          'non-senesced floral structures present': 'http://purl.obolibrary.org/obo/PPO:0002325',
          'unopened floral structures present': 'http://purl.obolibrary.org/obo/PPO:0002326',
          'opening floral structures present': 'http://purl.obolibrary.org/obo/PPO:0002327',
          'opened floral structures present': 'http://purl.obolibrary.org/obo/PPO:0002328',
          'pollen-releasing floral structures present': 'http://purl.obolibrary.org/obo/PPO:0002329',
          'senesced floral structures present': 'http://purl.obolibrary.org/obo/PPO:0002330',
          'flowers present': 'http://purl.obolibrary.org/obo/PPO:0002331',
          'non-senesced flowers present': 'http://purl.obolibrary.org/obo/PPO:0002332',
          'unopened flowers present': 'http://purl.obolibrary.org/obo/PPO:0002333',
          'opening flowers present': 'http://purl.obolibrary.org/obo/PPO:0002334',
          'opened flowers present': 'http://purl.obolibrary.org/obo/PPO:0002335',
          'pollen-releasing flowers present': 'http://purl.obolibrary.org/obo/PPO:0002336',
          'senesced flowers present': 'http://purl.obolibrary.org/obo/PPO:0002337',
          'flower heads present': 'http://purl.obolibrary.org/obo/PPO:0002338',
          'non-senesced flower heads present': 'http://purl.obolibrary.org/obo/PPO:0002339',
          'unopened flower heads present': 'http://purl.obolibrary.org/obo/PPO:0002340',
          'opening flower heads present': 'http://purl.obolibrary.org/obo/PPO:0002341',
          'opened flower heads present': 'http://purl.obolibrary.org/obo/PPO:0002342',
          'pollen-releasing flower heads present': 'http://purl.obolibrary.org/obo/PPO:0002343',
          'senesced flower heads present': 'http://purl.obolibrary.org/obo/PPO:0002344',
          'fruits present': 'http://purl.obolibrary.org/obo/PPO:0002345',
          'ripening fruits present': 'http://purl.obolibrary.org/obo/PPO:0002346',
          'unripe fruits present': 'http://purl.obolibrary.org/obo/PPO:0002347',
          'ripe fruits present': 'http://purl.obolibrary.org/obo/PPO:0002348',
          'cones present': 'http://purl.obolibrary.org/obo/PPO:0002349',
          'pollen cones present': 'http://purl.obolibrary.org/obo/PPO:0002350',
          'fresh pollen cones present': 'http://purl.obolibrary.org/obo/PPO:0002351',
          'open pollen cones present': 'http://purl.obolibrary.org/obo/PPO:0002352',
          'pollen-releasing pollen cones present': 'http://purl.obolibrary.org/obo/PPO:0002353',
          'seed cones present': 'http://purl.obolibrary.org/obo/PPO:0002354',
          'fresh seed cones present': 'http://purl.obolibrary.org/obo/PPO:0002355',
          'ripening seed cones present': 'http://purl.obolibrary.org/obo/PPO:0002356',
          'unripe seed cones present': 'http://purl.obolibrary.org/obo/PPO:0002357',
          'ripe seed cones present': 'http://purl.obolibrary.org/obo/PPO:0002358',
          'abscised plant structures present': 'http://purl.obolibrary.org/obo/PPO:0002359',
          'abscised leaves present': 'http://purl.obolibrary.org/obo/PPO:0002360',
          'abscised fruits or seeds present': 'http://purl.obolibrary.org/obo/PPO:0002361',
          'abscised cones or seeds present': 'http://purl.obolibrary.org/obo/PPO:0002362'
        };

        vm.dataSources = [
          'NPN',
          'PEP725',
          'NEON',
          'ASU'
        ];

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
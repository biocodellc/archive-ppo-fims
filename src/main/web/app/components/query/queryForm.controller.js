(function () {
    'use strict';

    angular.module('fims.query')
        .controller('QueryFormController', QueryFormController);

    QueryFormController.$inject = ['queryParams', 'queryService', 'queryResults', 'projectConfigService',
        'usSpinnerService', 'exception'];

    function QueryFormController(queryParams, queryService, queryResults, projectConfigService, usSpinnerService, exception) {
        var vm = this;

        // select lists
        vm.traits = [];
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

        activate();

        function activate() {
            getTraits();
        }

        function queryJson() {
            usSpinnerService.spin('query-spinner');

            queryService.queryJson(queryParams.build(), 0, 10000)
                .then(queryJsonSuccess)
                .catch(queryJsonFailed)
                .finally(queryJsonFinally);

            function queryJsonSuccess(data) {
                queryResults.update(data);
            }

            function queryJsonFailed(response) {
                exception.catcher("Failed to load query results")(response);
                vm.queryResults.isSet = false;
            }

            function queryJsonFinally() {
                usSpinnerService.stop('query-spinner');
            }

        }

        function getTraits() {
            projectConfigService.getList("phenophase_description", 27) // TODO don't hardcode the projectId
                .then(function (response) {
                    vm.traits = response.data;
                });
        }
    }
})();
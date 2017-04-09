(function () {
    'use strict';

    angular.module('fims.query')
        .controller('QueryTableController', QueryTableController);

    QueryTableController.$inject = ['$scope', 'queryResults'];

    function QueryTableController($scope, queryResults) {
        var TABLE_COUMN_MAP = {
            "Observation_ID": "Observation ID",
            "Genus": "Genus",
            "Species": "Species",
            "Day_of_Year": "Day of Year",
            "Observation_Date": "Year",
            "Latitude": "Latitude",
            "Longitude": "Longitude",
            "Source": "Source"
        };

        var vm = this;
        vm.queryResults = queryResults;

        vm.tableColumns = Object.values(TABLE_COUMN_MAP);
        vm.tableData = [];
        vm.currentPage = 1;
        vm.pageSize = 50;
        vm.updatePage = updatePage;

        function updatePage() {
            var start = (vm.currentPage - 1) * vm.pageSize;
            var end = start + vm.pageSize;

            var data = vm.queryResults.data.slice(start, end);

            prepareTableData(data);
        }

        /*
         transform the data into an array so we can use sly-repeat to display it. sly-repeat bypasses the $watches
         greatly improving the performance of sizable tables
         */
        function prepareTableData(data) {
            vm.tableData = [];

            if (data.length > 0) {

                angular.forEach(data, function (resource) {
                    var resourceData = [];
                    angular.forEach(Object.keys(TABLE_COUMN_MAP), function (key) {
                        if (key === "Observation_Date" && resource[key]) {
                            resourceData.push(resource[key].split("-")[0])
                        } else {
                            resourceData.push(resource[key]);
                        }
                    });
                    vm.tableData.push(resourceData);
                });

            }
        }

        $scope.$watch('queryTableVm.queryResults.data', function () {
            vm.currentPage = 1;
            updatePage();
        });
    }

})();
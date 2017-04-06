(function() {
    'use strict';

    angular.module('fims.projects')
        .factory('projectConfigService', projectConfigService);

    projectConfigService.$inject = ['$http', 'exception', 'REST_ROOT'];

    function projectConfigService($http, exception, REST_ROOT) {

        var projectConfig = {
            getList: getList,
            getFilterOptions: getFilterOptions
        };

        return projectConfig;

        function getList(listName, projectId) {
            return $http.get(REST_ROOT + "projects/" + projectId + "/config/lists/" + listName + "/fields")
                .catch(exception.catcher("Failed to load \"" + listName + "\" list"));
        }

        function getFilterOptions(projectId) {
            return $http.get(REST_ROOT + "projects/" + projectId + "/filterOptions")
                .catch(exception.catcher("Failed to load filter options."));
        }
    }

})();
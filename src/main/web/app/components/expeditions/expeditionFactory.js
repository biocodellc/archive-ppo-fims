angular.module('fims.expeditions')

    .factory('ExpeditionFactory', ['$http', 'exception', 'REST_ROOT',
        function ($http, exception, REST_ROOT) {
            var expeditionFactory = {
                getExpeditions: getExpeditions,
                getExpeditionsForAdmin: getExpeditionsForAdmin,
                updateExpeditions: updateExpeditions
            };

            return expeditionFactory;

            function getExpeditions(projectId) {
                return $http.get(REST_ROOT + 'projects/' + projectId + '/expeditions')
                    .catch(exception.catcher("Failed to load Expeditions."));
            }

            function getExpeditionsForAdmin(projectId) {
                return $http.get(REST_ROOT + 'projects/' + projectId + '/expeditions?admin');
            }

            function updateExpeditions(projectId, expeditions) {
                return $http({
                    method: 'PUT',
                    url: REST_ROOT + 'projects/' + projectId + "/expeditions",
                    data: expeditions,
                    keepJson: true
                });
            }
        }]);
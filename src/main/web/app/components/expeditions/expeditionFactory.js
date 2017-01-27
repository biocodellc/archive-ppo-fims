angular.module('fims.expeditions')

    .factory('ExpeditionFactory', ['$http', 'REST_ROOT',
        function ($http, REST_ROOT) {
            var expeditionFactory = {
                getExpeditions: getExpeditions,
                getExpeditionsForAdmin: getExpeditionsForAdmin,
                updateExpeditions: updateExpeditions
            };

            return expeditionFactory;

            function getExpeditions(projectId) {
                return $http.get(REST_ROOT + 'projects/' + projectId + '/expeditions');
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
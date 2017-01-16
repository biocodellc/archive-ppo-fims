angular.module('fims.projects')

    .factory('ProjectFactory', ['$http', 'UserFactory', 'REST_ROOT',
        function ($http, UserFactory, REST_ROOT) {
            var projectFactory = {
                getProjects: getProjects,
                getProjectsForUser: getProjectsForUser,
                getProjectsForAdmin: getProjectsForAdmin,
                updateProject: updateProject
            };

            return projectFactory;

            function getProjects(includePublic) {
                return $http.get(REST_ROOT + 'projects?includePublic=' + includePublic);
            }

            function getProjectsForUser() {
                return $http.get(REST_ROOT + 'users/' + UserFactory.user.userId + '/projects');
            }

            function getProjectsForAdmin() {
                return $http.get(REST_ROOT + 'users/' + UserFactory.user.userId + '/admin/projects');
            }

            function updateProject(project) {
                return $http({
                    method: 'POST',
                    url: REST_ROOT + 'projects/' + project.projectId,
                    data: project,
                    keepJson: true
                });
            }
        }]);
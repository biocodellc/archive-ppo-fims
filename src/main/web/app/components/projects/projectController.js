angular.module('fims.projects')

    .controller('ProjectCtrl', ['UserFactory', 'ProjectFactory', 'FailModalFactory',
        function (UserFactory, ProjectFactory, FailModalFactory) {
            var vm = this;
            vm.username = UserFactory.user.username;
            vm.projects = [];
            vm.getProjects = getProjects;

            function getProjects() {
                ProjectFactory.getProjectsForAdmin()
                    .then(function (response) {
                        angular.extend(vm.projects, response.data);
                    }, function (response) {
                        FailModalFactory.open("Failed to load projects", response.data.usrMessage);
                    })

            }

            (function init() {
                getProjects();
            }).call(this);

            angular.element(document).ready(function () {
                // populateProjectPage(UserFactory.user.username);

                fimsBrowserCheck($('#warning'));

                $(document).ajaxStop(function () {
                    if ($(".pwcheck").length > 0) {
                        $(".pwcheck").pwstrength({
                            texts: ['weak', 'good', 'good', 'strong', 'strong'],
                            classes: ['pw-weak', 'pw-good', 'pw-good', 'pw-strong', 'pw-strong']
                        });
                    }
                });
            });

        }])

    .controller('ProjectManagerProjectCtrl', ['UserFactory', 'ProjectFactory',
        function (UserFactory, ProjectFactory) {
            var vm = this;
            vm.editMetadata = false;
            vm.metadataSuccess = null;
            vm.metadataError = null;
            vm.project = null;
            vm.updateProject = updateProject;


            function updateProject() {
                ProjectFactory.updateProject(vm.project)
                    .then(
                        function(response) {
                            vm.metadataSuccess = "Successfully updated project";
                            vm.editMetadata = false;
                        }, function (response) {
                            vm.metadataError = response.data.error || response.data.usrMessage || "Server Error!";
                        }
                    );
            }
        }]);

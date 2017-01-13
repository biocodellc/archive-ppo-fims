angular.module('fims.templates')

    .controller('TemplateConfigModalCtrl', ['$scope', '$http', '$uibModalInstance', 'REST_ROOT', 'config', 'projectId', 'new',
        function ($scope, $http, $uibModalInstance, REST_ROOT, config, projectId, newConfig) {
            var vm = this;
            vm.config = config;
            vm.new = newConfig;

            vm.remove = remove;
            vm.close = close;
            vm.save = save;

            function close(val) {
                $uibModalInstance.close(val);
            }

            function remove() {
                $http.get(REST_ROOT + "projects/" + projectId + "/removeTemplateConfig/" + config.replace("/\//g", "%2F"))
                    .then(
                        function(response) {
                           close();
                        }, function(response) {
                            var error = response.data.error || response.data.usrMessage || "Server Error!";
                            $uibModalInstance.dismiss(error);
                        }
                    )
            }

            function save() {
                $scope.$broadcast('show-errors-check-validity');

                if (vm.config.toUpperCase() == "DEFAULT") {
                    vm.configForm.config.$setValidity("default", false);
                } else {
                    vm.configForm.config.$setValidity("default", true);
                }

                if (vm.configForm.$invalid) {
                    return;
                }

                var checked = [];
                $("#cat1 input[type='checkbox']:checked").each(function () {
                    checked.push($(this).data().uri);
                });

                var data = {
                    configName: vm.config,
                    checkedOptions: checked,
                    projectId: projectId
                };

                $http.post(REST_ROOT + "projects/" + projectId + "/saveTemplateConfig", data).then(
                    function (response) {
                        close(vm.config);
                    }, function (response) {
                        var error = response.data.error || response.data.usrMessage || "Server Error!";
                        $uibModalInstance.dismiss(error);
                    }
                )
            }
        }]);

angular.module('fims.templates')

    .controller('TemplateCtrl', ['$scope', '$http', '$timeout', '$uibModal', 'REST_ROOT',
        function ($scope, $http, $timeout, $uibModal, REST_ROOT) {
            var vm = this;
            vm.error = null;
            vm.projectId = null;
            vm.configs = [];
            vm.config = 'Default';
            vm.populateConfigs = populateConfigs;
            vm.removeConfig = removeConfig;
            vm.showRemoveConfig = showRemoveConfig;
            vm.updateCheckedBoxes = updateCheckedBoxesAngular;
            $scope.saveTemplateConfig = saveTemplateConfig;

            function updateCheckedBoxesAngular() {
                updateCheckedBoxes(vm.config);
            }

            function showRemoveConfig() {
                var defaultConfig = vm.config && vm.config.toUpperCase() == 'DEFAULT';

                return vm.configs && vm.configs.length > 1 && !defaultConfig;
            }

            function saveTemplateConfig() {
                vm.config = null;
                modalInstance = $uibModal.open({
                    templateUrl: 'app/components/templates/templateConfigModal.tpl.html',
                    size: 'md',
                    controller: 'TemplateConfigModalCtrl',
                    controllerAs: 'vm',
                    windowClass: 'app-modal-window',
                    backdrop: 'static',
                    resolve: {
                        config: function () {
                            return vm.config;
                        },
                        projectId: function () {
                            return vm.projectId;
                        },
                        new: function () {
                            return true;
                        }
                    }
                });

                modalInstance.result
                    .then(
                        function (config) {
                            vm.config = config;
                        },
                        function (error) {
                            vm.error = error;
                        }
                    )
                    .finally(function () {
                        if (!vm.config) {
                            vm.config = 'Default';
                        }
                        vm.populateConfigs();
                    });
            }

            function populateConfigs() {
                $http.get(REST_ROOT + "projects/" + vm.projectId + "/getTemplateConfigs")
                    .then(
                        function (response) {
                            vm.configs = response.data;
                        }, function (response) {
                            vm.error = response.data.error || response.data.usrMessage || "Server Error!";
                            vm.configs = [];
                        }
                    )
            }

            function removeConfig() {
                modalInstance = $uibModal.open({
                    templateUrl: 'app/components/templates/templateConfigModal.tpl.html',
                    size: 'md',
                    controller: 'TemplateConfigModalCtrl',
                    controllerAs: 'vm',
                    windowClass: 'app-modal-window',
                    backdrop: 'static',
                    resolve: {
                        config: function () {
                            return vm.config;
                        },
                        projectId: function () {
                            return vm.projectId;
                        },
                        new: function () {
                            return false;
                        }
                    }
                });

                modalInstance.result
                    .then(
                        function (config) {
                            vm.config = config;
                        },
                        function (error) {
                            vm.error = error;
                        }
                    )
                    .finally(function () {
                        if (!vm.config) {
                            vm.config = 'Default';
                        }
                        vm.populateConfigs();
                        vm.updateCheckedBoxes();
                    });

            }

            $scope.$watch('templateVm.projectId', function (value) {
                if (value > 0) {
                    populateColumns('#cat1');
                    populateAbstract('#abstract');
                    populateConfigs();
                } else {
                    vm.projectId = null;
                    vm.configs = null;
                }
            });


            $('#cat1').delegate("#save_template", 'click', saveTemplateConfig);

            $('input').click(populate_bottom);

            $('#default_bold').click(function () {
                $('.check_boxes').prop('checked', true);
                populate_bottom();
            });
            $('#excel_button').click(function () {
                var li_list = new Array();
                $(".check_boxes").each(function () {
                    li_list.push($(this).text());
                });
                if (li_list.length > 0) {
                    download_file();
                }
                else {
                    showMessage('You must select at least 1 field in order to export a spreadsheet.');
                }
            });
        }]);
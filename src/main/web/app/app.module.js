var app = angular.module('ppoApp', [
    'ui.router',
    'ui.bootstrap',
    'fims.query',
    'fims.auth',
    'fims.templates',
    'fims.expeditions',
    'fims.validation',
    'fims.projects',
    'fims.users',
    'fims.lookup',
    'fims.creator',
    'utils.autofocus'
]);

var currentUser = {};
app.run(['UserFactory', function(UserFactory) {
    UserFactory.setUser(currentUser);
}]);

angular.element(document).ready(function() {
    if (!angular.isDefined(window.sessionStorage.ppo)) {
        // initialize the ppo sessionStorage object to not get undefined errors later when
        // JSON.parse($window.sessionStorage.ppo) is called
        window.sessionStorage.ppo = JSON.stringify({});
    }
    
    var ppoSessionStorage = JSON.parse(window.sessionStorage.ppo);
    var accessToken = ppoSessionStorage.accessToken;
    if (!isTokenExpired() && accessToken) {
        $.get('/ppo/rest/users/profile?access_token=' + accessToken, function (data) {
            currentUser = data;
            angular.bootstrap(document, ['ppoApp']);
        }).fail(function() {
            angular.bootstrap(document, ['ppoApp']);
        });
    } else {
        angular.bootstrap(document, ['ppoApp']);
    }
});


app.controller('ppoCtrl', ['$rootScope', '$scope', '$state', '$location', 'AuthFactory',
    function($rootScope, $scope, $state, $location, AuthFactory) {
        $scope.error = $location.search()['error'];
        
        $rootScope.$on('$stateChangeStart', function (event, next) {
            if (next.loginRequired && !AuthFactory.isAuthenticated) {
                event.preventDefault();
                /* Save the user's location to take him back to the same page after he has logged-in */
                $rootScope.savedState = next.name;

                $state.go('login');
            }
        });
}]);

app.controller('NavCtrl', ['$rootScope', '$scope', '$location', '$state', 'AuthFactory', 'UserFactory',
    function ($rootScope, $scope, $location, $state, AuthFactory, UserFactory) {
        var vm = this;
        vm.isAuthenticated = AuthFactory.isAuthenticated;
        vm.isAdmin = UserFactory.isAdmin;
        vm.user = UserFactory.user;
        vm.logout = logout;
        vm.login = login;

        function login() {
            $rootScope.savedState = $state.current.name;
            $rootScope.savedStateParams = $state.params;
        }
        function logout() {
            AuthFactory.logout();
            UserFactory.removeUser();
        }

        $scope.$watch(
            function(){ return AuthFactory.isAuthenticated},

            function(newVal) {
                vm.isAuthenticated = newVal;
            }
        )

        $scope.$watch(
            function(){ return UserFactory.isAdmin},

            function(newVal) {
                vm.isAdmin = newVal;
            }
        )
    }]);

// register an interceptor to convert objects to a form-data like string for $http data attributes and
// set the appropriate header
app.factory('postInterceptor', ['$injector', '$httpParamSerializerJQLike',
    function ($injector, $httpParamSerializerJQLike) {
        return {
            request: function (config) {
                if (config.method == "POST") {
                    config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                    if (config.data instanceof Object)
                        config.data = $httpParamSerializerJQLike(config.data);
                }
                return config;
            }
        };
    }])

    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('postInterceptor');
    }]);

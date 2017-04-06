angular.module('ppoApp')

.config(['$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $locationProvider) {

        // make trailing / optional
        $urlMatcherFactoryProvider.strictMode(false);

        $stateProvider
            .state('main', {
                templateUrl: "app/partials/main.html",
                abstract: true
            })
            .state('fullPage', {
                templateUrl: "app/partials/fullPage.html",
                abstract: true
            })
            .state('home', {
                parent: "main",
                url: "/",
                templateUrl: "app/components/home/home.html",
            })
            .state('login', {
                url: "/login",
                templateUrl: "app/components/auth/login.html",
                controller: "LoginCtrl as vm",
                parent: "main",
            })
            .state('resetPass', {
                url: "/resetPass",
                templateUrl: "app/components/users/resetPass.html",
                controller: "ResetPassCtrl as vm",
                parent: "main",
            })
            .state('query', {
                url: "/query",
                templateUrl: "app/components/query/query.html",
                controller: "QueryController as vm",
                parent: "fullPage",
            })
            .state('profile', {
                url: "/secure/profile?error",
                templateUrl: "app/components/users/profile.html",
                controller: "UserCtrl as vm",
                loginRequired: true
            })
            .state('projects', {
                url: "/secure/projects",
                templateUrl: "app/components/projects/projects.html",
                controller: "ProjectCtrl as vm",
                parent: "main",
                loginRequired: true
            })
            .state('expeditionManager', {
                url: "/secure/expeditions",
                templateUrl: "app/components/expeditions/expeditions.html",
                controller: "ExpeditionCtrl as vm",
                parent: "main",
                loginRequired: true
            })
            .state('notFound', {
                url: '*path',
                parent: "main",
                templateUrl: "app/partials/page-not-found.html"
            });

        $locationProvider.html5Mode(true);
    }]);

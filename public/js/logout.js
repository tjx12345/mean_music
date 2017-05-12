(function(angular) {
    angular.module('app.logout', ['ui.router'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('logout', {
                url: '/logout',
                templateUrl: '../../views/logout.html',
                controller: 'logoutController'
            })
        }])
        .controller('logoutController', ['$scope', 'userStock', '$state', '$timeout', function($scope, userStock, $state, $timeout) {
            $scope.msg = '正在退出。。请稍后';
            userStock.setName('');
            $timeout(function() {
                $state.go('index');
            }, 3000)
        }])


})(angular);

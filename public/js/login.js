(function(angular) {
    angular.module('app.login', ['ui.router'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('login', {
                url: '/login',
                templateUrl: '../../views/login.html',
                controller: 'loginController',
            })
        }])
        .controller('loginController', ['$scope', '$http', '$state', 'userStock', function($scope, $http, $state, userStock) {
            $scope.doSubmit = function() {
                $http.post('/do-login', $scope.data)
                    .then(function(res) {
                        userStock.setName($scope.data);
                        if (res.data.code === '001') {
                            window.sessionStorage.token = res.data.token;
                            $state.go('index');
                        } else {
                            alert('用户名或密码错误')
                        }
                    })
            }
            $scope.data = { username: 'guangzhou5qi', password: 'guangzhou5qi', rememberme: true };



        }])

})(angular);

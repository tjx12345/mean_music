(function(angular) {
    var app = angular.module('app.register', ['ui.router'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('register', {
                url: '/register',
                templateUrl: '../../views/register.html'
            })
        }])
    app.directive('checkPwd', function() {
        return {
            templateUrl: '../../views/checkpwd.html',
            link: function(scope, ele, attrs) {

                scope.changeColor = function(num) {
                    for (var i = 1; i <= 3; i++) {
                        var divEle = angular.element(ele.children().children()[i]);
                        divEle.css('background-color', '');
                    }
                    //判断级别给页面元素加颜色
                    var colors = ['yellow', 'green', 'red'];
                    for (var i = 1; i <= num; i++) {
                        var divEle = angular.element(ele.children().children()[i]);
                        divEle.css('background-color', colors[i - 1]);
                    }
                }
            }
        }
    });
    app.controller('registerController', ['$scope', '$http', '$state', function($scope, $http, $state) {
        $scope.doSubmit = function() {
            // url: '/doRegister',
            // type: 'post',
            // data: $('#frm').serialize(),
            // dataType: 'json',
            // success: function(data) {
            //     if (data.code === '001') { //注册成功跳转到登录页面
            //         alert(data.msg);
            //         window.location = '/login';
            //     } else { //失败就提示注册失败信息
            //         alert(data.msg);
            //     }


            // }
            $http.post('/doRegister', $scope.data)
                .then(function(res) {
                    if (res.data.code === '001') {
                        $state.go('login');
                    } else {
                        alert(res.data.msg);
                    }
                })
        }
        $scope.checkUsername = function() {
            if ($scope.data.username.length < 6) return;
            $http.post('/check-user-name', { username: $scope.data.username })
                .then(function(res) {
                    if (res.data.code === '001') {
                        $scope.submitable1 = true;
                        $scope.msg = res.data.msg;
                    } else {
                        $scope.submitable1 = false;
                        $scope.msg = res.data.msg;
                    }
                })
        }
        $scope.checkPwd = function() {
            var check1 = false;
            var check2 = false;
            var check3 = false;

            check1 = false;
            var pwd = $scope.data.password;
            if (pwd.length < 6) return;
            var pwdLevel = 0;
            var reg1 = /\d/;
            var reg2 = /[a-zA-Z]/;
            var reg3 = /[~!@#$%^&*]/;
            //判断，如果三次都满足的话，此时肯定是具备共同的满足条件
            if (reg1.test(pwd)) pwdLevel++;
            if (reg2.test(pwd)) pwdLevel++;
            if (reg3.test(pwd)) pwdLevel++;

            console.log(pwdLevel);
            $scope.pwdLevel = pwdLevel;
            $scope.changeColor(pwdLevel);
        }
        $scope.data = {};
        $scope.isAgree = true;
        $scope.submitable1 = false;
        $scope.submitable2 = false;
        $scope.submitable3 = false;

    }])
})(angular);

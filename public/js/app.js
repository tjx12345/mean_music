(function(angular) {
    var app = angular.module('app', [
        'ui.router',
        'app.register',
        'app.login',
        'app.userStock',
        'app.addMusic',
        'app.edit',
        'app.musicList',
        'app.logout',

    ]);
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider', function($httpProvider, $stateProvider, $urlRouterProvider) {
        $httpProvider.defaults.headers.post = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        $httpProvider.defaults.transformRequest = function(obj) {
            var str = [];
            for (var key in obj) {
                var type = typeof obj[key];
                if (type !== 'string') { //区分单独字符串或者对象
                    obj[key] = JSON.stringify(obj[key])
                }
                str.push(key + '=' + obj[key]);
            }
            return str.join('&');
        }
        $httpProvider.interceptors.push(function() {
            return {
                request: function(config) {
                    if (window.sessionStorage.token) {
                        config.headers.Authorization = 'Bearer ' + window.sessionStorage.token;
                    }
                    return config;
                },
                response: function(response) {
                    return response;
                }
            }
        })
        $urlRouterProvider.otherwise('login');
    }]);


    // 头部自定义指令
    app.directive('myHeader', ['userStock', function(userStock) {
        return {
            templateUrl: '../../views/partials/header_n.html',
            link: function(scope, ele, attrs) {
                //当路由发生改变，获取名称，保存在serivce中
                //改变获取service
                scope.user = userStock; //用户信息
                scope.$watch('user.getName()', function(newV, oldV) {
                    scope.title = newV.username;

                });
            }
        }
    }])
    app.service("cache", function($cacheFactory) {
            return $cacheFactory("mycache", { capacity: 3 })
        })
        // app.controller('musicListController', ['$scope', '$http', '$cacheFactory', 'cache', function($scope, $http, $cacheFactory, cache) {
        //     $http.post('/abc', { musicList: [{ $$hashKey: 'aaa', name: 'a啊啊' }, { $$hashKey: 'aaa', name: '2' }] })
        //         .then(function(res) {
        //             console.log(res);
        //         });

    //     //测试get缓存
    //     $http.get('/abc', { cache: true }) // 或者 cache:cache 后续可以通过url来remove
    //         .then(function(res) {
    //             console.log(cache.get('/abc'));
    //             return $http.get('/abc', { cache: true })
    //         })
    //         .then(function(res) {
    //             console.log('aaa');
    //         })
    // }]);

})(angular);

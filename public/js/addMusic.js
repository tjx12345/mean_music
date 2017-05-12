(function(angular) {
    angular.module('app.addMusic', ['ui.router'])
        .controller('addController', ['$scope', '$http', '$state', function($scope, $http, $state) {
            $scope.addMusic = function(formData) {
                var fd = new FormData();
                fd.append('title', formData.title);
                fd.append('time', formData.time);
                fd.append('singer', formData.singer);
                fd.append('filelrc', document.getElementById('filelrc').files[0]);
                fd.append('file', document.getElementById('file').files[0]);

                $http.post('/check/upload', fd, {
                        headers: {
                            'content-type': undefined
                        },
                        transformRequest: function(data) {
                            return data;
                        }
                    })
                    .then(function(res) {
                        if (res.data.code === '001') {
                            alert('添加成功');
                            $state.go('index');
                        } else {
                            alert('添加失败');
                        }
                    })
            }
        }])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('addMusic', {
                url: '/addMusic',
                templateUrl: '../../views/add.html'
            })
        }])
})(angular);

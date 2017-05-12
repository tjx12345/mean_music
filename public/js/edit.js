(function(angular) {
    angular.module('app.edit', ['ui.router'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('edit', {
                url: '/edit/:mid',
                templateUrl: '../../views/edit.html',
                controller: 'editController'
            })
        }])
        .controller('editController', ['$state', '$scope', '$http', function($state, $scope, $http) {
            var mid = $state.params.mid;
            $http.get('/edit/' + mid)
                .then(function(res) {
                    $scope.music = res.data;
                })
            $scope.doSave = function(formData) {
                var fd = new FormData();
                fd.append('title', formData.title);
                fd.append('time', formData.time);
                fd.append('singer', formData.singer);
                fd.append('filelrc', document.getElementById('filelrc').files[0]);
                fd.append('file', document.getElementById('file').files[0]);
                fd.append('_id', $scope.music._id);

                $http.post('/editUpload', fd, {
                        headers: {
                            'content-type': undefined
                        },
                        transformRequest: function(data) {
                            return data;
                        }
                    })
                    .then(function(res) {
                        if (res.data.code === '001') {
                            alert('更新成功');
                            $state.go('index');
                        } else {
                            alert('添加失败');
                        }
                    })
            }
        }])
})(angular)

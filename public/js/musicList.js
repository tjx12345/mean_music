(function(angular) {
    angular.module('app.musicList', ['ui.router'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('index', {
                url: '/index',
                templateUrl: '../../views/ag_template/musicList.html',
                controller: 'musicListController'
            })
        }])
        .controller('musicListController', ['$scope', '$http', function($scope, $http) {
            $http.get('/check/musics')
                .then(function(res) {
                    $scope.musics = res.data.musics;
                });
            $scope.changeSrc = function(music) {
                $http.get('/getLrc?path=' + music.lrcSrc)
                    .then(function(res) {
                        $scope.lrcObj = res.data;
                        $scope.createUI($scope.lrcObj);

                        //播放音乐事件
                        var audio = document.getElementById('audio')
                        audio.ontimeupdate = function(e) {
                            $scope.scroll(Math.round(e.target.currentTime));
                        }


                        $scope.audio_src = music.musicSrc;
                    });

            }
            $scope.scroll = function(jumpTime) {
                if (!$scope.lrcObj[jumpTime]) return;
                var $ = angular.element;
                var lrc = $(document.getElementById('lrc'));
                var targetP = lrc.find('p[time=' + jumpTime + ']');
                var jumpPonint = targetP.offset().top - lrc.offset().top;

                targetP.addClass('hl').siblings().removeClass('hl');
                lrc.animate({
                    'top': -jumpPonint
                }, 'slow');

            }

            $scope.createUI = function(lrcObj) {
                var html = '';
                for (var key in lrcObj) {
                    html += '<p time=' + key + '>' + lrcObj[key] + '</p>'
                }
                document.getElementById('lrc').innerHTML = html;
            }

        }]);
})(angular);

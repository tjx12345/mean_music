(function(angular) {
    var app = angular.module('app.userStock', []);
    app.service('userStock', function() {
        this.name = '';
        this.getName = function() {
            return this.name;
        }
        this.setName = function(name) {
            this.name = name;
        }
    })
})(angular);

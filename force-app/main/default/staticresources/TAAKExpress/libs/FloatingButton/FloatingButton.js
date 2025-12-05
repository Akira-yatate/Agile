angular.module('floating-button', [])
.controller('FloatingButtonController', function ($scope) {
})
.directive('floatingButton', function () {
    return {
        restrict: 'E',
        // require: 'parameter', 
        scope:{
            parameter: '='
        },
        templateUrl: window.URLS.floatingButtonTemplate,
        link: function($scope, element, attrs, $model){
            
        }
    }
})

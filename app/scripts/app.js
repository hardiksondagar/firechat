'use strict';

/**
* @ngdoc overview
* @name chatApp
* @description
* # chatApp
*
* Main module of the application.
*/
angular.module('chatApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'firebase',
    'firebase.ref',
    'firebase.auth',
    'angucomplete-alt'
    ]);


angular.module('chatApp').config(['$compileProvider',function( $compileProvider ) {   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|data):/);
}
]);


angular.module('chatApp').filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
  }
});


angular.module('chatApp').filter('bytes', function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    }
});

angular.module('chatApp').directive('ngRepeatDirective', function() {
  return function(scope, element, attrs) {
    if (scope.$last){
      $(".chat-message").animate({ scrollTop: $('.chat-message').prop("scrollHeight")}, 100);
  }
}
});

angular.module('chatApp').directive('imageOnLoadDirective', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                $('.chat-message').scrollTop($('.chat-message')[0].scrollHeight);
                $(".chat-message").animate({ scrollTop: $('.chat-message').prop("scrollHeight")}, 100);
            });
        }
    };
});

angular.module('chatApp').directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

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
    'firebase.auth'
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

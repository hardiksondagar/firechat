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
    'angucomplete-alt',
    'ui.bootstrap',
    'emojiApp'
    ]);


angular.module('chatApp').config(['$compileProvider',function( $compileProvider ) {   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|data):/);
}]);



function ucfirst (str) {
    // inspired by: http://kevin.vanzonneveld.net
    str += '';
    var f = str.charAt(0).toUpperCase();
    return f + str.substr(1);
}

var getIndexIfObjWithOwnAttr = function(array, attr, value) {
    for(var i = 0; i < array.length; i++) {
        if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}
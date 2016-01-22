'use strict';

angular.module('chatApp').filter('limitHtml', function() {
    return function(text, limit) {

        var changedString = String(text).replace(/<[^>]+>/gm, '');
        var length = changedString.length;
        var result = changedString.length > limit ? changedString.substr(0, limit - 1) : changedString;
        return result;
    }
})
'use strict';

/* Seach in Object */

var comparator = function(obj, text) {
    if (obj && text && typeof obj === 'object' && typeof text === 'object') {
        for (var objKey in obj) {
            if (objKey.charAt(0) !== '$' && hasOwnProperty.call(obj, objKey) &&
                comparator(obj[objKey], text[objKey])) {
                return true;
        }
    }
    return false;
}
text = ('' + text).toLowerCase();
return ('' + obj).toLowerCase().indexOf(text) > -1;
};

var search = function(obj, text) {
    if (typeof text == 'string' && text.charAt(0) === '!') {
        return !search(obj, text.substr(1));
    }
    switch (typeof obj) {
        case "boolean":
        case "number":
        case "string":
        return comparator(obj, text);
        case "object":
        switch (typeof text) {
            case "object":
            return comparator(obj, text);
            default:
            for (var objKey in obj) {
                if (objKey.charAt(0) !== '$' && search(obj[objKey], text)) {
                    return true;
                }
            }
            break;
        }
        return false;
        case "array":
        for (var i = 0; i < obj.length; i++) {
            if (search(obj[i], text)) {
                return true;
            }
        }
        return false;
        default:
        return false;
    }
};

angular.module('chatApp').filter('conversation', function() {


   return function(items, word, users) {


    if(!word) {
        return items;
    }

    var filtered = [];
    angular.forEach(items, function(item) {
        if(search(item,word)){
            filtered.push(item);
        } else if(typeof users[item.chatWith] != "undefined" && search(users[item.chatWith],word)) {
            filtered.push(item);
        }

    });

    return filtered;
};
});
'use strict';


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
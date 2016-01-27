/**
 * @ngdoc function
 * @name chatApp.directive:ngShowAuth
 * @description
 * # ngShowAuthDirective
 * A directive that shows elements only when user is logged in. It also waits for Auth
 * to be initialized so there is no initial flashing of incorrect state.
 */
 angular.module('chatApp')
 .directive('ngUnreadChatCount', ['$timeout' ,'Auth', 'chatService', function ($timeout, Auth, chatService) {
  'use strict';

  return {
    restrict: 'E',
    transclude: true,
    scope: {},
    template:"<span class=\"badge\" ng-if=\"unreadChat.length\" >{{unreadChat.length}}</span>",
    link: function(scope, el) {

        el.addClass('ng-cloak'); // hide until we process it

        function update(authData) {
          if(authData){
            scope.unreadChat=chatService.getUnreadChatCount(authData.uid);
          }
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            el.toggleClass('ng-cloak', !Auth.$getAuth());
          }, 0);
        }

        Auth.$onAuth(update);
        update();
      }
    };
  }]);

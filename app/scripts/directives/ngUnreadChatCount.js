/**
 * @ngdoc function
 * @name tipntripApp.directive:ngShowAuth
 * @description
 * # ngShowAuthDirective
 * A directive that shows elements only when user is logged in. It also waits for Auth
 * to be initialized so there is no initial flashing of incorrect state.
 */
angular.module('chatApp').directive('ngUnreadChatCount', ['$timeout', 'Auth', 'chatService', 'userService', function ($timeout, Auth, chatService, userService) {
        'use strict';

        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            template: "<span class=\"badge\" ng-if=\"unreadChat.length\" >{{unreadChat.length}}</span>",
            link: function (scope, el) {

                el.addClass('ng-cloak'); // hide until we process it

                function update(authData) {
                    if (authData) {
                        scope.unreadChat = chatService.getUnreadChatCount(authData.uid);
                        scope.unreadChat.$watch(function (event) {

                            if (event.event == 'child_added' || event.event == 'child_changed') {

                                var chat = scope.unreadChat[scope.unreadChat.$indexFor(event.key)];

                                userService.get(chat.lastMessage.uid).$loaded(function (user) {
                                    var notification = {
                                        sender: user._name,
                                        body: chat.lastMessage.text,
                                        chat_id: event.key,
                                        icon: user._image,
                                        id: chat.lastMessage.id
                                    };
                                    notifyMe(notification);
                                });
                            }
                        });
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
(function() {
  'use strict';

  angular
  .module('chatApp')
  .factory('firebaseDataService', firebaseDataService);

  firebaseDataService.$inject = ['FBURL'];

  function firebaseDataService(FBURL) {
    var root = new Firebase(FBURL);

    var service = {
      root: root,
      chat_messages: root.child('chat-messages'),
      users: root.child('users'),
      user_chats: root.child('user-chats'),
      search: root.child('search')
    };

    return service;
  }

})();
(function() {
  'use strict';

  angular
  .module('chatApp')
  .factory('chatService', chatService);

  chatService.$inject = ['$firebaseArray', 'firebaseDataService', '$q'];

  function chatService($firebaseArray, firebaseDataService, $q) {

    var service = {
      getChatId : getChatId,
      getUserFromChatId : getUserFromChatId,
      getChats : getChats,
      getChatMessages : getChatMessages,
      sendMessage : sendMessage,
      updateModifiedAt : updateModifiedAt,
      initMessage:initMessage,
      markReadUserChat:markReadUserChat,
      getUnreadChatCount:getUnreadChatCount
    };

    return service;

    ////////////


    /* [MAGIC] To enable one to one chat this functions generates chat_id from the chat's members's uid */
    /* http://stackoverflow.com/questions/33540479/best-way-to-manage-chat-channels-in-firebase/33547123#33547123 */
    function getChatId(user1,user2) {

      if(!user1 || !user2) {
        return false;
      }

      var chat_id;
      if(user1 > user2) {
        chat_id = 'chat-'+user1+user2;
      } else {
        chat_id = 'chat-'+user2+user1;
      }
      return chat_id;
    }

    function getUserFromChatId(chat_id, auth_uid) {
      if(chat_id) {
        return chat_id.replace('chat-', '').replace(auth_uid,'');
      }
      return false;
    }

    function getChats(uid) {
      return $firebaseArray(firebaseDataService.user_chats.child(uid).orderByChild('modifiedAt').limitToLast(100));
    }

    function getChatMessages(chat_id) {
      return $firebaseArray(firebaseDataService.chat_messages.child(chat_id).orderByChild('createdAt').limitToLast(10));
    }

    function sendMessage(newMessage,chat_id) {

      var defer = $q.defer();

      if(!chat_id) {

        defer.reject("Please select chat to send message");
        return defer.promise;
      }

      if(!newMessage.text && !newMessage.file) {
        defer.reject("Please type message or select file to send message");
        return defer.promise;
      }

      /* Handle file thing */
      if(newMessage.file) {
        var f  = newMessage.file;
        var reader = new FileReader();
        reader.onload = (function(theFile) {

          return function(e) {

            if(f.size>=10485760) {
              /* Firebase supports only 10 MB node size */
              defer.reject("Cannot upload files with size more than 10MB");
              return defer.promise;
            }

            newMessage.file = {
              payload:e.target.result,
              name:f.name,
              type:f.type,
              size:f.size,
              createdAt:Firebase.ServerValue.TIMESTAMP
            };

            /* Save message with file */
            saveMessage(newMessage,chat_id)
            .then(function(ref){
              defer.resolve(ref);
            },function(error){
              defer.reject(error);
            });

          };
        })(f);
        reader.readAsDataURL(f);

      } else {

        /* Save message with text only */
        saveMessage(newMessage,chat_id)
        .then(function(ref){
          defer.resolve(ref);
        },function(error){
          defer.reject(error);
        });
      }

      return defer.promise;

    };

    function saveMessage(message,chat_id) {

      var defer = $q.defer();

      $firebaseArray(firebaseDataService.chat_messages.child(chat_id)).$add(message).then(
          // success promise callback
          function(ref) {

            /* On success updated chat's modified time to order chats modification time */
            updateModifiedAt(chat_id,message);
            defer.resolve(ref);

          },
          // error promise callback
          function(error) {
            defer.reject(error);
          }
          );

      return defer.promise;

    }

    function updateModifiedAt(chat_id,message) {

      var lastMessage = { text:null, type:null };

      if(message.file) {
        lastMessage.type = 'file';
        lastMessage.text = message.file.name;
      } else {
        lastMessage.type = 'text';
        lastMessage.text = message.text;
      }

      var uid = getUserFromChatId(chat_id, message.uid);

      updateUserChatWithUnread(uid,chat_id,lastMessage);
      updateUserChat(message.uid,chat_id,lastMessage);

    }

    function updateUserChat(uid,chat_id,lastMessage) {
      var ref = firebaseDataService.user_chats.child(uid).child(chat_id);
      ref.update({
        modifiedAt:Firebase.ServerValue.TIMESTAMP,
        lastMessage:lastMessage
      });
    }

    function updateUserChatWithUnread(uid,chat_id,lastMessage) {

      var ref = firebaseDataService.user_chats.child(uid).child(chat_id);
      ref.transaction(function(data) {
        var unread_count = (!data || typeof data.unread_count == "undefined" ) ? 1: parseInt(data.unread_count)+1;
        return {
          modifiedAt:Firebase.ServerValue.TIMESTAMP,
          lastMessage:lastMessage,
          unread_count:unread_count
        }
      });
    }

    function markReadUserChat(uid,chat_id) {

      var ref = firebaseDataService.user_chats.child(uid).child(chat_id).child('unread_count');
      ref.transaction(function(unread_count) {
        return 0;
      });

    }

    function getUnreadChatCount(uid){
      return  $firebaseArray(firebaseDataService.user_chats.child(uid).orderByChild('unread_count').startAt(1));
    }

    function initMessage(uid){
      var newMessage = {
       text:null,
       createdAt:Firebase.ServerValue.TIMESTAMP,
       uid:uid,
       file:null
     };
     return newMessage;
   }

 }


})();
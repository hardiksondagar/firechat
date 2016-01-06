'use strict';
/**
 * @ngdoc function
 * @name chatApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * A demo of using AngularFire to manage a synchronized list.
 */
 angular.module('chatApp')
 .controller('ChatCtrl', function ($scope, user, Ref, $q, $firebaseArray, $firebaseObject, $timeout) {
    // synchronize a read-only, synchronized array of messages, limit to most recent 10

    $scope.user=user;
    $scope.selected=null;
    $scope.chat_members=[];
    $scope.users=[];
    $scope.listUsers=$firebaseArray(Ref.child('users').limitToLast(10));
    

    /* Load Chats */
    $scope.chats= $firebaseArray(Ref.child('user-chats').child($scope.user.uid).orderByChild('modifiedAt').limitToLast(10));

    $scope.chats.$watch(function(event) {
      $scope.getChatMeta(event.key);
    });
    
    $scope.getChatMeta=function(chat_id)
    {
      var chat_members=$firebaseArray(Ref.child('chat-members').child(chat_id));

      /* Once uid loaded, get user details associated with the uid */
      chat_members.$loaded().then(function(chat_members){

        angular.forEach(chat_members, function(member, key) {
          if(member.$id!==$scope.user.uid)
          {
            $scope.chat_members[chat_id]=member.$id;
          }

          var user = $firebaseObject(Ref.child('users').child(member.$id));
          user.$loaded().then(function(user)
          {
            $scope.users[user.$id]=user;
          });

        });
      });
    }

    
    $scope.selectChat = function(chat_id)
    {
      $scope.selected=chat_id;
      $scope.messages=$firebaseArray(Ref.child('chat-messages').child(chat_id).orderByChild('createdAt').limitToLast(10));
      $scope.messages.$loaded().catch(alert);
    }

    $scope.getChatId=function(user1,user2)
    {
      var chat_id;
      if(user1>user2)
      {
        chat_id='chat-'+user1+user2;
      }
      else {
        chat_id='chat-'+user2+user1;
      }
      return chat_id;
    }

    $scope.addMessage = function(newMessage,chat_id) {
      if( newMessage && chat_id ) {
        // var chat_id=$scope.getChatId(uid,$scope.user.uid);
        var ref = Ref.child('chat-messages').child(chat_id), def = $q.defer();
        var message= { 
          text:newMessage,
          createdAt:Firebase.ServerValue.TIMESTAMP,
          uid:$scope.user.uid 
        };
        ref.push(message, function(err) {
          $scope.updateModifiedAt(chat_id);
        });
      }
    };

    $scope.initChat = function(uid)
    {

      if($scope.user.uid==uid)
      {
        alert('Cannot chat with yourself');
        return false;
      }
      var chat_id=$scope.getChatId(uid,$scope.user.uid);
      var ref = Ref.child('user-chats').child($scope.user.uid).child(chat_id);
      var chat= $firebaseObject(ref);
      chat.$loaded().then(function(data)
      {
        var ref = Ref.child('user-chats').child($scope.user.uid).child(chat_id);
        ref.set({
          modifiedAt:Firebase.ServerValue.TIMESTAMP
        });
        
        var ref = Ref.child('user-chats').child(uid).child(chat_id);
        ref.set({
          modifiedAt:Firebase.ServerValue.TIMESTAMP
        });
        
        var ref = Ref.child('chat-metas').child(chat_id);
        ref.set({
          createdAt:Firebase.ServerValue.TIMESTAMP,
          type:"1to1"
        });

        var ref = Ref.child('chat-members').child(chat_id);
        ref.child(uid).set(true);
        ref.child($scope.user.uid).set(true);

        $scope.selectChat(chat_id);

      });
    }

    $scope.updateModifiedAt=function(chat_id)
    { 


     var chat_members=$firebaseArray(Ref.child('chat-members').child(chat_id));

     chat_members.$loaded().then(function(chat_members){

       angular.forEach(chat_members, function(member, key) {
        var ref = Ref.child('user-chats').child(member.$id).child(chat_id);
        ref.set({
          modifiedAt:Firebase.ServerValue.TIMESTAMP
        });

      });
     });

     
   }

   function alert(msg) {
    $scope.err = msg;
    $timeout(function() {
      $scope.err = null;
    }, 5000);
  }
});

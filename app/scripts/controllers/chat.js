'use strict';
/**
 * @ngdoc function
 * @name chatApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 */
 angular.module('chatApp')
 .controller('ChatCtrl', function ($scope, user, Ref, $q, $firebaseArray, $firebaseObject, $timeout, chatService, userService) {


  /* Firebase USER actions */
  
  /* user from the route resolve, contains logged in users' data */
  $scope.user = user;

  /* $scop.users stores information about user's details and used in many place like showing name in chat list and in single chat's message body */
  $scope.users = [];

  $scope.getUser = function(uid) {
    if(typeof $scope.users[uid] == "undefined") {
      userService.get(uid).$loaded().then(function(user){
        $scope.users[user.$id] = angular.extend({},user);
      });
    }
  }

  /* Get loggedIn user ( again )*/
  $scope.getUser($scope.user.uid);

  /* load Profile to set EnterToSend button value */
  var profile = $firebaseObject(Ref.child('users/'+user.uid));
  profile.$bindTo($scope, 'profile');

  /* Firebase USER actions ends*/





  /* Firebase CHAT actions */

  /* $scope.chats stores all the chats the logged in user part of ( it'll be sorted by modified time  
  so latest chat will always comes on the top 
  */
  $scope.chats = chatService.getChats($scope.user.uid);   

  /* on chat list load fetch all the related details like chat's members, member's user details etc */
  $scope.chats.$watch(function(event) {
    $scope.loadChatDetails(event.key);
  });


  /* $scope.loadChatDetails updates the $scope.users with chat's user */
  $scope.loadChatDetails = function(chat_id) {
    var chatWith = $scope.getChatWith(chat_id);
    $scope.chats[$scope.chats.$indexFor(chat_id)].chatWith = chatWith;
    $scope.getUser(chatWith);
  }

  $scope.getChat = function(chat_id) {
    return $scope.chats[$scope.chats.$indexFor(chat_id)];
  }

  $scope.getChatWith = function(chat_id) {
    return chatService.getUserFromChatId(chat_id, $scope.user.uid);
  }

  /* Firebase CHAT actions ends*/




  /* Util functions */

  /* This function used to display error messages */
  function alert(msg) {
    $scope.loading.send=false;
    $scope.err = msg;
    $timeout(function() {
      $scope.err = null;
    }, 5000);
  }


  /* Util functions ends */



  


  
  /* $scope.selected used to determine which chat is currently selected */
  $scope.selected = null;

  /* $scope.messages stores all chat's messages */
  $scope.messages = {};
  
  $scope.loading = { messages:false,send:false };







  /* Start New Chat */

  $scope.initNewChat=function() {
    $scope.selected=false;
  }


  /* [TEMPORARY TO INITIATE CONVERSATION] $scope.listUsers is list of users registered in system */
  
  $scope.userslist = userService.list();

  
  $scope.selectedUser = function(user) {

    if (user) {
      var chat_id = chatService.getChatId(user.originalObject.$id,$scope.user.uid);
      $scope.selectChat(chat_id);
    } else {
      console.log('cleared');
    }
  };

  /* Start New Chat Ends*/


  


  /* This function is use to select chat  */
  $scope.selectChat = function(chat_id)
  {
    /* store selected chat id */
    $scope.selected=chat_id;
    $scope.loading.messages=true;

    /* fetch messages of selected chat */
    $scope.messages[chat_id]= chatService.getChatMessages(chat_id); 

    $scope.messages[chat_id].$loaded().then(function() {
      $scope.loading.messages=false;
    }, function(error){
      alert(error);
      $scope.loading.messages=false;
    }).catch(alert);

  }

  $scope.newMessage = chatService.initMessage($scope.user.uid);

  /* To send message to chat */
  $scope.sendMessage = function(newMessage,chat_id) {

    $scope.loading.send = true;

    $scope.newMessage = chatService.initMessage($scope.user.uid);

    chatService.sendMessage(newMessage,chat_id).then(function(ref){
      console.log("new message added with id "+ ref.key());
      $scope.loading.send = false;
    },function(error){
      alert(error);
      $scope.loading.send = false;
    })
    return;
  };

});
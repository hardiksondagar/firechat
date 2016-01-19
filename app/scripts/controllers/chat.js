'use strict';
/**
 * @ngdoc function
 * @name chatApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 */
 angular.module('chatApp')
 .controller('ChatCtrl', function ($scope, user, Ref, $q, $firebaseArray, $firebaseObject, $timeout) {
   
  
  /* Firebase USER actions */
  
  /* user from the route resolve, contains logged in users' data */
  $scope.user=user;

  /* $scop.users stores information about user's details and used in many place like showing name in chat list and in single chat's message body */
  $scope.users=[];

  $scope.getUser = function(uid) {
    /* Retrieve user's info */
    var user = $firebaseObject(Ref.child('users').child(uid));
    user.$loaded().then(function(user) {
      $scope.users[user.$id]=user;
      $scope.users[user.$id].name = ucfirst(user.first_name) + ' ' + ucfirst(user.last_name);
    });
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
  $scope.chats= $firebaseArray(Ref.child('user-chats').child($scope.user.uid).orderByChild('modifiedAt').limitToLast(100));


  /* on chat list load fetch all the related details like chat's members, member's user details etc */
  $scope.chats.$watch(function(event) {
    $scope.loadChatDetails(event.key);
  });

  /* $scope.loadChatDetails updates the $scope.users with chat's user */
  $scope.loadChatDetails=function(chat_id) {

    var uid = $scope.getUserFromChatId(chat_id);
    $scope.getUser(uid);
  }

  /* Firebase CHAT actions ends*/








  /* Util functions */

  /* [MAGIC] To enable one to one chat this functions generates chat_id from the chat's members's uid */
  /* http://stackoverflow.com/questions/33540479/best-way-to-manage-chat-channels-in-firebase/33547123#33547123 */
  $scope.getChatId = function(user1,user2) {
    var chat_id;
    if(user1>user2) {
      chat_id='chat-'+user1+user2;
    } else {
      chat_id='chat-'+user2+user1;
    }
    return chat_id;
  }

  /* Reverse of above function :  Get user's uid from the chat_id */
  $scope.getUserFromChatId = function(chat_id) {
    return chat_id.replace('chat-', '').replace($scope.user.uid,'');
  }

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
  $scope.usersArray = $firebaseArray(Ref.child('users').limitToLast(10));

  
  $scope.usersArray.$loaded().then(function(users){
    angular.forEach(users, function(user, key) {
      $scope.usersArray[key].name=user.first_name+" "+user.last_name;
    });
  });


  $scope.selectedUser = function(user) {

    if (user) {
      var chat_id=$scope.getChatId(user.originalObject.$id,$scope.user.uid);
      $scope.selectChat(chat_id);
      $scope.loadChatDetails(chat_id);
      // $scope.initChat(user.originalObject.$id)
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
    $scope.messages[chat_id]= $firebaseArray(Ref.child('chat-messages').child(chat_id).orderByChild('createdAt').limitToLast(10));

    $scope.messages[chat_id].$loaded().then(function() {
      $scope.loading.messages=false;
    }).catch(alert);

  }



  /* To send message to chat */
  $scope.sendMessage = function(newMessage,chat_id) {

    $scope.newMessage=null;

    if(!chat_id) {
      alert("Please select chat to send message");
      return;
    }

    if(typeof newMessage.text == "undefined" && typeof newMessage.file == "undefined") {
      alert("Please type message or select attachment to send message");
      return;
    }

    $scope.loading.send = true;

    /* Save message along with creation timestamp and send's uid */
    var message= { 
      text:null,
      createdAt:Firebase.ServerValue.TIMESTAMP,
      uid:$scope.user.uid,
      file:null
    };

    if(typeof newMessage.text != "undefined") {
      message.text=newMessage.text;
    }

    /* Handle file thing */
    if(typeof newMessage.file != 'undefined') {
      var f  = newMessage.file;
      var reader = new FileReader();
      reader.onload = (function(theFile) {

        return function(e) {

          if(f.size>=10485760) {
            /* Firebase supports only 10 MB node size */
            alert('Cannot upload files with size more than 10MB');
            return;
          }

          message.file = {
            payload:e.target.result,
            name:f.name,
            type:f.type,
            size:f.size,
            createdAt:Firebase.ServerValue.TIMESTAMP
          };

          document.getElementById("file").value = "";

          /* Save message with file */
          $scope.saveMessage(message,chat_id);

        };
      })(f);
      reader.readAsDataURL(f);

    } else {

      /* Save message with text only */
      $scope.saveMessage(message,chat_id);

    }
  };


  /* Save new message to firebase */
  $scope.saveMessage= function(message,chat_id) {
    /* Get reference to chat-messages by chat_id */
    var ref = Ref.child('chat-messages').child(chat_id);


    var newMessage = ref.push();
    newMessage.set(message,function(ref) {
      /* On success updated chat's modified time to order chats modification time */
      $scope.updateModifiedAt(chat_id, message);
      $scope.loading.send=false;
    });
  }

  /* This function updates the chat's last modification timestamp */
  $scope.updateModifiedAt = function(chat_id, message) { 

    var lastMessage = { text:null, type:null };

    if(message.file) {
      lastMessage.type = 'file';
      lastMessage.text = message.file.name;
    } else {
      lastMessage.type = 'text';
      lastMessage.text = message.text;
    }

    var uid = $scope.getUserFromChatId(chat_id);

    $scope.updateUserChat(uid,chat_id,lastMessage);
    $scope.updateUserChat($scope.user.uid,chat_id,lastMessage);

  }

  $scope.updateUserChat = function(uid,chat_id,lastMessage) {
    var ref = Ref.child('user-chats').child(uid).child(chat_id);
    ref.set({
      modifiedAt:Firebase.ServerValue.TIMESTAMP,
      lastMessage:lastMessage
    });
  }

});

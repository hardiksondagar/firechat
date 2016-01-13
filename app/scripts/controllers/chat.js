'use strict';
/**
 * @ngdoc function
 * @name chatApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 */
 angular.module('chatApp')
 .controller('ChatCtrl', function ($scope, user, Ref, $q, $firebaseArray, $firebaseObject, $timeout) {

  /* user from the route resolve, contains logged in users' data */
  $scope.user=user;
  
  /* $scope.chats stores all the chats the logged in user part of ( it'll be sorted by modified time  
  so latest chat will always comes on the top 
  */
  $scope.chats= $firebaseArray(Ref.child('user-chats').child($scope.user.uid).orderByChild('modifiedAt').limitToLast(10));

  /* $scope.chat_metas stores chat's details like person's name, last message, modified timestamp */
  $scope.chat_metas=[];

  
  /* $scope.selected used to determine which chat is currently selected */
  $scope.selected=null;

  /* $scope.messages stores selected chat's messages */
  $scope.messages=[];
  
  /* $scop.users stores information about user's details and used in many place like showing name in chat list and in single chat's message body */
  $scope.users=[];

  $scope.loading={messages:false,send:false};


  /* [TEMPORARY TO INITIATE CONVERSATION] $scope.listUsers is list of users registered in system */
  $scope.listUsers=$firebaseArray(Ref.child('users').limitToLast(10));


  /* on chat list load fetch all the related details like chat's members, member's user details etc */
  $scope.chats.$watch(function(event) {
    $scope.loadChatDetails(event.key);
  });


  /* load Profile to set EnterToSend button value */
  var profile = $firebaseObject(Ref.child('users/'+user.uid));
  profile.$bindTo($scope, 'profile');

  /* $scope.loadChatDetails fetchs the chat's meta data including chat's members, member's user info */
  $scope.loadChatDetails=function(chat_id)
  {

    /* Get chat's members */
    var chat_members=$firebaseArray(Ref.child('chat-members').child(chat_id));
    if(typeof $scope.chat_metas[chat_id]== "undefined")
    {
      $scope.chat_metas[chat_id]={user:null,meta:null,lastMessage:null};
    }
    /* Once chat's members loads fetch their user infos ( name and photo ) */
    chat_members.$loaded().then(function(chat_members){

      angular.forEach(chat_members, function(member, key) {

        /* set uid of user with logged in user is chatting */
        if(member.$id!==$scope.user.uid)
        {
          $scope.chat_metas[chat_id].user=member.$id;
        }

        /* Retrieve user's info */
        var user = $firebaseObject(Ref.child('users').child(member.$id));
        user.$loaded().then(function(user)
        {
          $scope.users[user.$id]=user;
        });
      });
    });

    /* Get last chat message */
    var chat_messages = $firebaseArray(Ref.child('chat-messages').child(chat_id).orderByChild('createdAt').limitToLast(1));
    chat_messages.$loaded().then(function(chat_messages)
    {
      $scope.chat_metas[chat_id].lastMessage=chat_messages[0];
    });

  }

  /* This function is use to select chat  */
  $scope.selectChat = function(chat_id)
  {
    /* store selected chat id */
    $scope.selected=chat_id;
    $scope.loading.messages=true;

    /* fetch messages of selected chat */
    $scope.messages = $firebaseArray(Ref.child('chat-messages').child(chat_id).orderByChild('createdAt').limitToLast(100));
    $scope.messages.$loaded().then(function()
    {
      $scope.loading.messages=false;
      console.log('messages loaded');
    }).catch(alert);
  }


  /* [MAGIC] To enable one to one chat this functions generates chat_id from the chat's members's uid */
  /* http://stackoverflow.com/questions/33540479/best-way-to-manage-chat-channels-in-firebase/33547123#33547123 */
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

  /* To send message to chat */
  $scope.sendMessage = function(newMessage,chat_id) {

    $scope.newMessage=null;

    if(!chat_id)
    {
      alert("Please select chat to send message");
      return;
    }

    if(typeof newMessage.text == "undefined" && typeof newMessage.file == "undefined")
    {
      alert("Please type message or select attachment to send message");
      return;
    }

    $scope.loading.send=true;


    /* Get reference to chat-messages by chat_id */
    var ref = Ref.child('chat-messages').child(chat_id);

    /* Save message along with creation timestamp and send's uid */
    var message= { 
      text:null,
      createdAt:Firebase.ServerValue.TIMESTAMP,
      uid:$scope.user.uid,
      file:null
    };

    if(typeof newMessage.text != "undefined")
    {
      message.text=newMessage.text;
    }

    /* Handle file thing */
    if(typeof newMessage.file != 'undefined') {
      var f  = newMessage.file;
      var reader = new FileReader();
      reader.onload = (function(theFile) {
        return function(e) {

          if(f.size>=10485760)
          {
            alert('Cannot upload files with size more than 10MB');
            return;
          }

          message.file={
            payload:e.target.result,
            name:f.name,
            type:f.type,
            size:f.size,
            createdAt:Firebase.ServerValue.TIMESTAMP
          };

          document.getElementById("file").value = "";
          $scope.messages.$add(message).then(function(ref) {
            var id = ref.key();
            console.log("added record with id " + id);
            console.log($scope.messages.$indexFor(id)); 
            /* On success updated chat's modified time to order chats modification time */
            $scope.updateModifiedAt(chat_id);
            $scope.loading.send=false;
          });
        };
      })(f);
      reader.readAsDataURL(f);

    } else {
      $scope.messages.$add(message).then(function(ref) {
        var id = ref.key();
        console.log("added record with id " + id);
        console.log($scope.messages.$indexFor(id));
        /* On success updated chat's modified time to order chats modification time */
        $scope.updateModifiedAt(chat_id);
        $scope.loading.send=false;

      });
    }
  };

  var getIndexIfObjWithOwnAttr = function(array, attr, value) {
    for(var i = 0; i < array.length; i++) {
      if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
        return i;
      }
    }
    return -1;
  }

  /* This function updates the chat's last modification timestamp */
  $scope.updateModifiedAt=function(chat_id)
  { 

    /* Get all members of chat */
    var chat_members=$firebaseArray(Ref.child('chat-members').child(chat_id));

    chat_members.$loaded().then(function(chat_members){

      /* Updated each member's conversation's last modification time */
      angular.forEach(chat_members, function(member, key) {

        var ref = Ref.child('user-chats').child(member.$id).child(chat_id);
        ref.set({
          modifiedAt:Firebase.ServerValue.TIMESTAMP
        });

      });
    });

  }

  $scope.initChat = function(uid)
  {

    var message="Hi there";

    if($scope.user.uid==uid)
    {
      alert('Cannot chat with yourself');
      return false;
    }

    var chat_id = $scope.getChatId(uid,$scope.user.uid);
    if($scope.chats.$getRecord(chat_id))
    {
      alert('Chat already initiated');
      $scope.selectChat(chat_id);
      return;
    }

    var ref = Ref.child('user-chats').child($scope.user.uid).child(chat_id);
    var chat= $firebaseObject(ref);
    chat.$loaded().then(function(data)
    {

      /* store chat metas */
      var ref = Ref.child('chat-metas').child(chat_id);
      ref.set({
        createdAt:Firebase.ServerValue.TIMESTAMP,
        type:"1to1"
      });

      /* store members */
      var ref = Ref.child('chat-members').child(chat_id);
      /* member 1 */
      ref.child(uid).set(true);
      /* member 2 */
      ref.child($scope.user.uid).set(true);

      /* and select initiated chat */
      $scope.selectChat(chat_id);

      /* Send sample message to initiate the chat */
      $scope.sendMessage(message,chat_id);

    });
  }


  /* This function used to display error messages */
  function alert(msg) {
    $scope.loading.send=false;
    $scope.err = msg;
    $timeout(function() {
      $scope.err = null;
    }, 5000);
  }
});

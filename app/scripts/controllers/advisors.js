'use strict';
/**
 * @ngdoc function
 * @name chatApp.controller:AdvisorsCtrl
 * @description
 * # AdvisorsCtrl
 */
 angular.module('chatApp')
 .controller('AdvisorsCtrl', function ($scope, user,  $uibModal, userService) {

  /* user from the route resolve, contains logged in users' data */
  $scope.user = user;


  /* [TEMPORARY TO INITIATE CONVERSATION] $scope.listUsers is list of users registered in system */
  
  $scope.userslist = userService.list();


  /* Start chat from popup */
  $scope.showChatModal = function(advisor, size){

    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'AdvisorChatModalContent.html',
      controller: 'AdvisorChatModalCtrl',
      size: size,
      resolve: {
        user: function() {
          return user;
        },
        advisor: function() {
          return advisor;
        }
      }
    });

    modalInstance.result.then(function (id) {
      if(id) {
        console.log("added record with id " + id);
      } else {
        console.log('Please select user and write some message');
      }
    }, function () {
      console.log('Model Dismissed');
    });

  }

});


// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

angular.module('chatApp').controller('AdvisorChatModalCtrl', function ($scope, $timeout, $uibModalInstance, chatService, user, advisor) {

  $scope.advisor = advisor;
  $scope.newMessage = chatService.initMessage(user.uid);
  $scope.loading = { send:false };
  $scope.status = null;


  $scope.sendMessage = function (newMessage) {

    $scope.newMessage = chatService.initMessage(user.uid);
    $scope.loading.send = true;
    var chat_id =  chatService.getChatId(advisor.$id, user.uid);
    chatService.sendMessage(newMessage, chat_id)
    .then(
      function(ref) {
        notify('Message successfully sent !');
      },
      function(error) {
        notify('Failed to send message, please try again');
      }
      );
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  /* This function used to display error messages */
  function notify(msg) {

    $scope.status = msg;
    $scope.loading.send = false;

    $timeout(function() {
      $uibModalInstance.close($scope.status);
    }, 2000);
  }

});

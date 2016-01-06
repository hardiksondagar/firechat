'use strict';
/**
 * @ngdoc function
 * @name chatApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Manages authentication to any active providers.
 */
 angular.module('chatApp')
 .controller('LoginCtrl', function ($scope, Auth, $location, $q, Ref, $timeout) {
  $scope.passwordLogin = function(user) {
    $scope.err = null;
    Auth.$authWithPassword({email: user.email, password: user.pass}, {rememberMe: true}).then(
      redirect, showError
      );
  };

  $scope.createAccount = function(user) {
    $scope.err = null;
    if( !user.pass ) {
      $scope.err = 'Please enter a password';
    }
    else if( user.pass !== user.confirm ) {
      $scope.err = 'Passwords do not match';
    }
    else {

      Auth.$createUser({email: user.email, password: user.pass})
      .then(function () {
            // authenticate so we have permission to write to Firebase
            return Auth.$authWithPassword({email: user.email, password: user.pass}, {rememberMe: true});
          })
      .then(function(auth)
      {
        createProfile(auth,user);
      })
      .then(redirect, showError);
    }

    function createProfile(user,user_details) {
      var ref = Ref.child('users').child(user.uid), def = $q.defer();
      ref.set({
        first_name: user_details.first_name, 
        last_name: user_details.last_name, 
        email: user_details.email, 
        username: firstPartOfEmail(user_details.email)
      }, 
      function(err) {
        $timeout(function() {
          if( err ) {
            def.reject(err);
          }
          else {
            def.resolve(ref);
          }
        });
      });
      return def.promise;
    }
  };

  function firstPartOfEmail(email) {
    return ucfirst(email.substr(0, email.indexOf('@'))||'');
  }

  function ucfirst (str) {
      // inspired by: http://kevin.vanzonneveld.net
      str += '';
      var f = str.charAt(0).toUpperCase();
      return f + str.substr(1);
    }



    function redirect() {
      $location.path('/account');
    }

    function showError(err) {
      $scope.err = err;
    }


  });

(function() {
  'use strict';

  angular
  .module('app.auth')
  .factory('authService', authService);

  authService.$inject = ['$rootScope', '$firebaseAuth', 'firebaseDataService','$firebaseObject'];

  function authService($rootScope, $firebaseAuth, firebaseDataService, $firebaseObject) {
    var firebaseAuthObject = $firebaseAuth(firebaseDataService.root);

    var currentUser;

    firebaseAuthObject.$onAuth(function(auth) {
      if(!angular.isUndefined(auth) && auth!=null)
      {
        currentUser = profile(auth.uid);  
      }else
      {
        currentUser=auth;
      }
      
    });

    var service = {
      firebaseAuthObject: firebaseAuthObject,
      register: register,
      login: login,
      logout: logout,
      isLoggedIn: isLoggedIn,
      sendWelcomeEmail: sendWelcomeEmail,
      profile:profile
    };

    return service;

    ////////////

    function register(user) {
      return firebaseAuthObject.$createUser(user);
    }

    function login(user) {
      return firebaseAuthObject.$authWithPassword(user);
    }

    function logout() {
      $rootScope.$broadcast('logout');
      firebaseAuthObject.$unauth();
    }

    function isLoggedIn() {
      return currentUser;
    }

    function sendWelcomeEmail(uid,email,restaurant) {
      firebaseDataService.users.child(uid).set({
        email: email, 
        restaurant:restaurant,
        name: name||firstPartOfEmail(email),
        credit: 3,
        sms: "Thank you for waiting, your table is ready"
      });
    }

    function profile(uid)
    {
      return $firebaseObject(firebaseDataService.users.child(uid));
    }

    function firstPartOfEmail(email) {
      return ucfirst(email.substr(0, email.indexOf('@'))||'');
    }

    function ucfirst (str) {
      // inspired by: http://kevin.vanzonneveld.net
      str += '';
      var f = str.charAt(0).toUpperCase();
      return f + str.substr(1);
    }

  }

})();
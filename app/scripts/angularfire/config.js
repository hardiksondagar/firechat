angular.module('firebase.config', [])
  .constant('FBURL', 'https://tipandtrip.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password'])
  .constant('loginRedirectPath', '/login');

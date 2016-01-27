(function() {
  'use strict';

  angular
  .module('chatApp')
  .factory('userService', userService);

  userService.$inject = ['firebaseDataService', 'UserObjectFactory','UserArrayFactory'];

  function userService(firebaseDataService, UserObjectFactory, UserArrayFactory) {

    var service = {
      get : get,
      list : list
    };

    return service;

    ////////////

    function get(uid) {
      return new UserObjectFactory(firebaseDataService.users.child(uid));
    }

    function list(searchQuery) {
      return new UserArrayFactory(firebaseDataService.users.limitToLast(20));
      
    }
  }

  
  // now let's create a synchronized array factory that uses our User
  angular
  .module('chatApp')
  .factory('UserObjectFactory', function ($firebaseObject, $firebaseUtils) {
    return $firebaseObject.$extend({
        //  Called each time there is an update from the server to update our User data
        $$updated: function (snap) {

            // call the super
            var changed = $firebaseObject.prototype.$$updated.apply(this, arguments);
            
            // manipulate the name
            if(!this._name) {
              this._name = ucfirst(this.first_name) + ' ' + ucfirst(this.last_name);
            }
            
            if(!this._image) {
              this._image = 'https://placeholdit.imgix.net/~text?bg=f27373&txtclr=ffffff&txt='+ ucfirst(this.first_name.charAt(0))+'&w=50&h=50&txtsize=24';
            }

            // inform the sync manager that it changed
            return changed;
          },

          // Used when our user is saved back to the server to remove name and image fileds
          toJSON: function() {
            return $firebaseUtils.toJSON(this);
          }
        });
  });

  // now let's create a synchronized array factory that uses our Widget
  angular.module('chatApp').factory("UserArrayFactory", function($firebaseArray, User) {
    return $firebaseArray.$extend({
    // change the added behavior to return User objects
    $$added: function(snap) {
      // instead of creating the default POJO (plain old JavaScript object)
      // we will return an instance of the User class each time a child_added
      // event is received from the server
      return new User(snap);
    },

    // override the update behavior to call User.update()
    $$updated: function(snap) {
      // we need to return true/false here or $watch listeners will not get triggered
      // luckily, our User.prototype.update() method already returns a boolean if
      // anything has changed
      return this.$getRecord(snap.key()).update(snap);
    }
  });
  });



  // an object to return in our UserFactory
  angular.module('chatApp').factory("User", function($firebaseUtils) {
    function User(snapshot) {
      // store the record id so AngularFire can identify it
      this.$id = snapshot.key();

      // apply the data
      this.update(snapshot);
    }

    User.prototype = {
      update: function(snapshot) {

        var oldData = angular.extend({}, this);
        angular.extend(this, snapshot.val());
        // add name and image
        this._name = ucfirst(this.first_name) + ' ' + ucfirst(this.last_name);
        this._image = 'https://placeholdit.imgix.net/~text?bg=f27373&txtclr=ffffff&txt='+ ucfirst(this.first_name.charAt(0))+'&w=50&h=50&txtsize=24';
        this.$priority = snapshot.getPriority();


        // determine if anything changed, note that angular.equals will not check
        // $value or $priority (since it excludes anything that starts with $)
        // so be careful when using angular.equals()
        return !angular.equals(this, oldData);
      },

      getName: function() {
        return this._name;
      },

      toJSON: function() {
        // since we changed where our data is stored, we need to tell AngularFire how
        // to get the JSON version of it. We can use $firebaseUtils.toJSON() to remove
        // private variables, copy the data into a shippable format, and do validation
        return $firebaseUtils.toJSON(this);
      }
    };

    return User;
  });



})();
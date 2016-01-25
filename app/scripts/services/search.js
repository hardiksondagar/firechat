(function() {
  'use strict';

  angular
  .module('chatApp')
  .factory('searchService', searchService);

  searchService.$inject = ['$firebaseArray', '$firebaseObject', 'firebaseDataService', '$q'];

  function searchService($firebaseArray, $firebaseObject, firebaseDataService, $q) {

    var service = {
      searchUser : searchUser,
      // searchConversation : searchConversation,
      buildQuery : buildQuery
    };

    return service;

    function searchUser(index, query) {
      return doSearch(index,'user',query);
    }

    // display search results
    function doSearch(index, type, query) {

      var defer = $q.defer();

      var newRequest = { index: index, type: type, query: query };
      $firebaseArray(firebaseDataService.search.child('request'))
      .$add(newRequest)
      .then(function(ref){
        console.log('Search query requested at '+ ref.key());
        defer.resolve($firebaseArray(firebaseDataService.search.child('response').child(ref.key()).child('hits')));
      },function(error){
        defer.reject(error);
      });

      return defer.promise;

    }

    function buildQuery(term, words) {
        // See this tut for more query options:
        // http://okfnlabs.org/blog/2013/07/01/elasticsearch-query-tutorial.html#match-all--find-everything
        return {
         'query_string': { query: makeTerm(term, words) }
       };
     }

     function makeTerm(term, matchWholeWords) {
       if( !matchWholeWords ) {
         if( !term.match(/^\*/) ) { term = '*'+term; }
         if( !term.match(/\*$/) ) { term += '*'; }
       }
       return term;
     }

    ////////////
  }


})();
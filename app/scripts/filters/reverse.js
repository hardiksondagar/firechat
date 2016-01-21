'use strict';

angular.module('chatApp').filter('reverse', function() {
	return function(items) {
		return angular.isArray(items)? items.slice().reverse() : [];
	};
});



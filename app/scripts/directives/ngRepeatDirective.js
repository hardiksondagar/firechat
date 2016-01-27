'use strict';


angular.module('chatApp').directive('ngRepeatDirective', function() {
	return function(scope, element, attrs) {
		if (scope.$last){
			/*
			function imageLoaded() {
   				// function to invoke for loaded image
       			// decrement the counter
       			counter--; 
       			console.log('image loaded');
       			if( counter === 0 ) {
           			// counter is 0 which means the last
           			//    one loaded, so do something else
           			$(".chat-message").animate({ scrollTop: $('.chat-message').prop("scrollHeight")}, 100);
           			console.log('last image loaded');
           		}
           	}
           	var images = $('.chat-message  img');
    		var counter = images.length;  // initialize the counter

    		images.each(function() {
    			if( this.complete ) {
    				imageLoaded.call( this );
    			} else {
    				$(this).one('load', imageLoaded);
    			}
    		});
*/
			//
			$(".chat-message").animate({ scrollTop: $('.chat-message').prop("scrollHeight")}, 100);
		}
	}
});

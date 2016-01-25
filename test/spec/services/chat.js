var mockfirebaseArray, mockfirebaseDataService, mockQ;


beforeEach(function(){
  module(function($provide){
    $provide.service('$firebaseArray', function(){
      this.alert = jasmine.createSpy('alert');
    });
    $provide.service('  firebaseDataService', function(){
      this.showModalDialog = jasmine.createSpy('showModalDialog');
    });
  });
  module('chatApp');
});



beforeEach(inject(function($window, modalSvc, sampleSvc){
  mockWindow=$window;
  mockModalSvc=modalSvc;
  sampleSvcObj=sampleSvc;
}));
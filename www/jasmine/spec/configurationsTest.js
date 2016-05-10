'use strict';
describe('自動ログイン', function() {
  var service, _$scope_, controller;
  beforeEach(function() {
    module('myApp');
  });
  // beforeEach(inject($provide) {
  //   $provide.factory('mockUsers', function($rootScope, mBaasService, ErrInterceptor) {
  //     return {
  //       getCurrentUser : function() {
  //         return {
  //           "objectId":"epaKcaYZqsREdSMY",
  //           "userName":"YamadaTarou",
  //           "authData":null,
  //           "mailAddress":null,
  //           "mailAddressConfirm":null,
  //           "createDate":"2013-08-28T11:27:16.446Z",
  //           "updateDate":"2013-08-28T12:03:28.926Z",
  //           "sessionToken":"epaKcaYZqsREdSMY",
  //           "acl":{
  //             "*":{
  //               "read":true,
  //               "write":true
  //             }
  //           }
  //         };
  //       }
  //     }
  //   });
  // });
  it("authService導入", inject(function(authService) {
    // expect(authService.say()).toEqual('nyafoo');
  }));
});

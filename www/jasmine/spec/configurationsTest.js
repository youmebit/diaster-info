'use strict';
describe('自動ログイン', function() {
  var users, _$scope_, controller;
  var userFactory = {};
  userFactory.current = {};
  userFactory.getCurrentUser = function() {
      return this.current;
  };

  userFactory.setCurrent = function(_current_) {
    this.current = _current_;
  };

  beforeEach(function() {
    angular.mock.module('myApp', function($provide) {
        var APP_KEY = '536ea833c07c98ed2cf1b836739a9729ad7544fc3a9e282e875f99e93bd8eb47';
        var CLIENT_KEY = 'c47f0f99bc98940357aeb142158515adbca19f165f49b579f1cce020a3135583';
        var ncmb = new NCMB(APP_KEY, CLIENT_KEY);
        ncmb.User.loginAsAnonymous().then(function(data) {
            var current = {
              "objectId":data.objectId,
              "userName":data.userName,
              "authData":data.authData,
              "password":data.password,
              "role":0
            };
            userFactory.setCurrent(current);
            $provide.factory('users', function(){return userFactory;});
        });
    });
  });

  it("authService導入", inject(function(authService, mBaasService) {
      authService.autoLogin();

        // var current = ncmb.User.getCurrentUser();
        // console.log(current.sessionToken);
  }));

});
function injectUsers(mockUsers) {
  module(function ($provide) {
      $provide.value('users', mockUsers);
  });
}

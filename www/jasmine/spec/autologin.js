'use strict';

var anonymous = {
  "objectId":"ZDFibxKPbkAiLV6Y",
  "userName":"FBPQj7pwFd",
  "authData":{"anonymous":{"id":"6dadb59b-d185-8e10-dabc-7c310da31f07"}},
  "mailAddress":null,
  "mailAddressConfirm":null,
  "sessionToken":"h3GbBMWU"
};

var member = {
  "objectId":"ZDFibxKPbkAiLV6Y",
  "userName":"YamadaTaro",
  "mailAddress":"mailTo@gmail.com",
  "mailAddressConfirm":true,
  "sessionToken":"t8XJZySj",
  "role":"0"
};

var LessThanLimit = function(data, current) {
  expect(data.sessionToken).toEqual(current.sessionToken);
}

describe('端末にユーザー情報あり', function() {
  var currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 1);
  var compare = function(data) {
    expect(111).toEqual(222);
  }
  test('ログイン有効期限内_一般ユーザー', anonymous, currentDate, LessThanLimit);
});

describe('端末にユーザー情報あり', function() {
  var currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 1);
  test('ログイン有効期限内_会員', member, currentDate, LessThanLimit);
});

describe('端末にユーザー情報あり', function() {
  var currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 25);
  var compare = function(data, current) {
    expect(data.sessionToken).toEqual("Pt76QvJX");
  }
  test('ログイン有効期限切れ_一般ユーザー', anonymous, currentDate, compare);
});


describe('端末にユーザー情報あり', function() {
  var currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 25);
  var compare = function(data, current) {
    expect(data.sessionToken).toEqual("Yn8QPGmR");
  }
  test('ログイン有効期限切れ_会員', member, currentDate, compare);
});

function test(desc, current, currentDate, compare) {
  describe(desc, function() {
    var rootScope, authService;
    beforeEach(function() {
      angular.mock.module('myApp', function($provide) {
          current.updateDate = currentDate.toISOString();
          userFactory.setCurrent(current);
          mockCurrent.setUpdateDate(currentDate);
          $provide.factory('users', function(){return userFactory;});
          $provide.factory('Current', function() {return mockCurrent});
      });
    });

    beforeEach(function () {
      inject(function ($rootScope, _authService_) {
          authService = _authService_;
          rootScope = $rootScope;
      })
    });

    it("端末のユーザー情報&セッショントークン", inject(function(authService, mBaasService) {
      spyOn(rootScope, '$broadcast').and.callThrough();
      rootScope.$on("autologin:success", function(event, data) {
        expect(data).not.toBeNull();
        compare(data, current);
      });
      authService.autoLogin();
      expect(rootScope.$broadcast).toHaveBeenCalled();
    }));
  });
}

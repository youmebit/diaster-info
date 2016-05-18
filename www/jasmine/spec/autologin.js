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

describe('端末にユーザー情報あり', function() {
  var currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 1);
  var LessThanLimit = function(session, user, rootScope) {
    expect(rootScope.$broadcast).not.toHaveBeenCalled();
    expect(session.sessionToken).toEqual("h3GbBMWU");
  }
  test('ログイン有効期限内_一般ユーザー', anonymous, currentDate, LessThanLimit);
});

describe('端末にユーザー情報あり', function() {
  var currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 1);
  var LessThanLimit = function(session, user, rootScope) {
    expect(rootScope.$broadcast).not.toHaveBeenCalled();
    expect(session.sessionToken).toEqual("t8XJZySj");
  }
  test('ログイン有効期限内_会員', member, currentDate, LessThanLimit);
});

describe('端末にユーザー情報あり', function() {
  var currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 25);
  var compare = function(data, current, rootScope) {
    expect(rootScope.$broadcast).toHaveBeenCalled();
    expect(data.sessionToken).toEqual("Pt76QvJX");
  }
  test('ログイン有効期限切れ_一般ユーザー', anonymous, currentDate, compare);
});


describe('端末にユーザー情報あり', function() {
  var currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 25);
  var compare = function(data, current, rootScope) {
    expect(rootScope.$broadcast).toHaveBeenCalled();
    expect(data.sessionToken).toEqual("Yn8QPGmR");
  }
  test('ログイン有効期限切れ_会員', member, currentDate, compare);
});

function test(desc, current, currentDate, compare) {
  describe(desc, function() {
    var rootScope, authInterceptor, httpProviderIt;
    beforeEach(function() {
      angular.mock.module('myApp', function($provide, $httpProvider) {
          httpProviderIt = $httpProvider;
          current.updateDate = currentDate.toISOString();
          userFactory.setCurrent(current);
          $provide.factory('users', function(){return userFactory;});
          $provide.factory('Current', function() {return mockCurrent});
      });
    });

    beforeEach(function () {
      inject(function ($rootScope, _authInterceptor_) {
          authInterceptor = _authInterceptor_;
          rootScope = $rootScope;
      })
    });

    it ('Interceptor確認', function() {
      expect(authInterceptor).toBeDefined();
    });
    it("端末のユーザー情報&セッショントークン", inject(function(mBaasService) {
      spyOn(rootScope, '$broadcast').and.callThrough();
      // rootScope.$on("autologin:success", function(event, data) {
      //   expect(data).not.toBeNull();
      //   compare(data, current);
      // });
      // authInterceptor.request({});
      authInterceptor.request({header : {}});
      console.log(JSON.stringify(mockCurrent.getCurrent()));
      expect(mockCurrent.getCurrent().sessionToken).not.toBeNull();
      expect(mockCurrent.username).toEqual(userFactory.userName);
      compare(mockCurrent.getCurrent(), userFactory.getCurrentUser(), rootScope);
    }));
  });
}

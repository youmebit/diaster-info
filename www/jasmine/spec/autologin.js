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
  test('ログイン有効期限内_一般ユーザー', anonymous, currentDate);
});

describe('端末にユーザー情報あり_ログイン有効期限内_会員', function() {
  var currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 1);
  member.updateDate = currentDate.toISOString();
  test('ログイン有効期限内_会員', member, currentDate);
});


function test(desc, current, date) {
  describe(desc, function() {
    var rootScope, authService;
    beforeEach(function() {
      angular.mock.module('myApp', function($provide) {
          current.updateDate = date.toISOString();
          userFactory.setCurrent(current);
          mockCurrent.setUpdateDate(date);
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
          expect(data.sessionToken).toEqual(current.sessionToken);
        });
        authService.autoLogin();
        expect(rootScope.$broadcast).toHaveBeenCalled();
        console.log(userFactory.getCurrentUser());
      }));


    // xdescribe('端末にユーザー情報あり_ログイン有効期限切れ_一般ユーザー', function() {
    //   var currentDate = new Date();
    //   currentDate.setHours(currentDate.getHours() + 25);
    //   loginGreatorThan24(anonymous, currentDate);
    // });
    //
    // xdescribe('端末にユーザー情報あり_ログイン有効期限切れ_会員', function() {
    //   var currentDate = new Date();
    //   currentDate.setHours(currentDate.getHours() + 25);
    //   loginGreatorThan24(member, currentDate);
    // });


  // 最終ログイン時刻が24時間以下のユーザーでのログイン
    function loginLessThan24(current, date) {
      current.updateDate = date.toISOString();
      userFactory.setCurrent(current);
      mockCurrent.setUpdateDate(date);
      it("端末のユーザー情報&セッショントークン", inject(function(authService, mBaasService) {
        spyOn(rootScope, '$broadcast').and.callThrough();
        rootScope.$on("autologin:success", function(event, data) {
          expect(data).not.toBeNull();
          expect(data.sessionToken).toEqual(current.sessionToken);
        });
        authService.autoLogin();
        expect(rootScope.$broadcast).toHaveBeenCalled();
        console.log(userFactory.getCurrentUser());
      }));
    }

    // 最終ログイン時刻が24時間以下のユーザーでのログイン
      function loginGreatorThan24(current, date) {
        current.updateDate = date.toISOString();
        userFactory.setCurrent(current);
        mockCurrent.setUpdateDate(date);
        it("端末のユーザー情報&セッショントークン", function() {
            spyOn(rootScope, '$broadcast').and.callThrough();
            rootScope.$on("autologin:success", function(event, data) {
              expect(data).not.toBeNull();
              expect(data.sessionToken).toEqual("Pt76QvJX");
            });
            authService.autoLogin();
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });
      }
  });
}

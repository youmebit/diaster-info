'use strict';

//　職員
var staff = {
  "username":"hoge@職員",
  "password":"hogehoge01",
  "email":"<職員用メールアドレス>",
  "role":"1"
};

//　会員
var member = {
  "username":"foo@会員",
  "password":"foofoo02",
  "email":"<会員用メールアドレス>",
  "role":"0"
};

describe("職員追加", function() {
  test(staff);
});

describe("会員追加", function() {
  test(member);
});

function test(u) {
  describe("", function() {
    beforeEach(module("myApp"));
    it("ユーザー追加", inject(function($rootScope, mBaasService, users){
      users.addAsAnonymous();
      var ok = function() {

      };
      var fail = function(err) {
        console.error(err);
      }
      users.add(u, ok, fail);
    }));
  });
}

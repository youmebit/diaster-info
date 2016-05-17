'use strict';

//　職員
var staff = {
  "userName":"hoge@職員",
  "password":"hogehoge01",
  "mailAddress":"<職員用メールアドレス>",
  "role":"1"
};

//　会員
var member = {
  "userName":"foo@会員",
  "password":"foofoo02",
  "mailAddress":"<会員用メールアドレス>",
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
      var ncmb = mBaasService.getNcmb();
      users.loginAsAnonymous();
      var user = new ncmb.User();
      user.set("userName", u.userName)
        .set("password", u.password)
        .set("mailAddress", u.mailAddress)
        .set("role", u.role);
      user.signUpByAccount()
      .catch(function (err) {
          if (err.status == 409) {
            console.error('会員名もしくはメールアドレスが既に登録されています。');
          }
        });
    }));
  });
}

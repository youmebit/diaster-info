'use strict';
app.controller('userCtrl', function ($scope, mBaasService) {
    $scope.user = {};
    $scope.signUp = function () {
        if (!confirm('登録してもよろしいですか?')) {
            return false;
        }

        // 会員追加
        var addUser = function() {
            var ncmb = mBaasService.getNcmb();
            var user = new ncmb.User();
            user.set("userName", $scope.signup.username)
                .set("password", $scope.signup.password)
                .set("mailAddress", $scope.signup.email)
            user.signUpByAccount()
            .then(function () {
                myNavigator.pushPage('user/regist_info.html');
            })
            .catch(function (err) {
                console.log(JSON.stringify(err));
                if (err.status == 409) {
                    fail('会員名もしくはメールアドレスが既に登録されています。');
                }
            });
        }
        
        addUser();
        
        var fail = function(message) {
            alert(message);
        }
    }
});

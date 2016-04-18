'use strict';
app.controller('userCtrl', function ($scope, mBaasService) {
    $scope.user = {};
    $scope.signUp = function () {
        if (!confirm('登録してもよろしいですか?')) {
            return false;
        }
        var ncmb = mBaasService.getNcmb();
        var user = new ncmb.User();
        user.set("userName", $scope.signup.username)
            .set("password", $scope.signup.password)
            .set("mailAddress", $scope.signup.email);

        user.signUpByAccount()
            .then(function () {
                myNavigator.pushPage('user/regist_info.html');
            })
            .catch(function (err) {
                var message = '';
                if (err.status) {
                    message = 'メールアドレスが重複します。';
                }
                alert(message);
            });
    }
});
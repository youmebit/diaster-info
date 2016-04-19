'use strict';
app.controller('userCtrl', function ($scope, mBaasService) {
    $scope.user = {};
    $scope.signUp = function () {
        if (!confirm('登録してもよろしいですか?')) {
            return false;
        }

        var ncmb = mBaasService.getNcmb();
        // ユーザ名の重複チェック
        ncmb.User.equalTo("userName", $scope.signup.username).fetchAll().then(function(result) {
            fail('名前が重複しています。');
        }).catch(function(err) {
            ncmb.Role.equalTo("roleName", "member").fetch()
            .then(function(result){
                addUser(result);
            })
            .catch(function(err) {
                var role = new ncmb.Role("member");
                role.save().then(function() {
                    addUser(role);
                });
            });
        });

        // 会員追加
        var addUser = function(role) {
            var ncmb = mBaasService.getNcmb();
            var user = new ncmb.User();
            user.set("userName", $scope.signup.username)
                .set("password", $scope.signup.password)
                .set("mailAddress", $scope.signup.email)
                .set("role", role);
            user.signUpByAccount()
            .then(function () {
                myNavigator.pushPage('user/regist_info.html');
            })
            .catch(function (err) {
                console.log(JSON.stringify(err));
                if (err.status == 409) {
                    fail('メールアドレスが重複します。');
                }
            });
        }
        
        var fail = function(message) {
            alert(message);
        }
    }
});

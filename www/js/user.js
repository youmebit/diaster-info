'use strict';
app.controller('userCtrl', function ($scope) {
    $scope.user = {};
    $scope.addUser = function () {
        var user = new $scope.ncmb.User();
        user.set("userName", $scope.user.name)
            .set("password", $scope.user.password)
            .set("mailAddress", $scope.user.address);

        user.signUpByAccount()
            .then(function () {
                // 登録後処理
            })
            .catch(function (err) {
                // エラー処理
            });
    }
});
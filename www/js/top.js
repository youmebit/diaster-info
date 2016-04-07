'use strict';
app.controller('topCtrl', function($scope, mBaasService) {
    $scope.settings.isHiddenTab = false;
//    if ($scope.isLogin) {
//        var user = mBaasService.getCurrentUser();
//        $scope.username = user.userName;
//        user.logout();
//    } else {
//        $scope.username = 'ゲスト';
//        var address = 'saltory72@gmail.com';
//        var password = 'password';
//        var ncmb = mBaasService.getNcmb();
//        ncmb.User.loginWithMailAddress(address, password).then(function(data){
//            console.log('ログインしました');
//        })
//        .catch(function(err){
//            alert('失敗');
//            console.log(err);
//        });
//    }
});
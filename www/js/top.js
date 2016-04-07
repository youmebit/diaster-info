'use strict';
app.controller('topCtrl', function($scope, mBaasService) {
    $scope.settings.isHiddenTab = false;
    $scope.user = {};
    var current = mBaasService.getCurrentUser();
    var ncmb = mBaasService.getNcmb();
    var success = function(data) {
         $scope.username = data.userName;
    }
    mBaasService.login('saltory72@gmail.com', 'password', success);
    $scope.$on('auto_login', function(event, data) {
      console.log(data);
$scope.$apply(function () {
        $scope.user.username = data;
        });
    });
//    if (current) {
//    } else {
//        $scope.username = 'ゲスト';
//    }


    //    $scope.isLogin = user.isCurrentUser();
//    if ($scope.isLogin) {
//        var user = mBaasService.getCurrentUser();
//        $scope.username = user.userName;
//        user.logout().then(function(user) {
//            
//        }).catch(function(err){
//            console.log(err);
//        });
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
'use strict';
app.controller('topCtrl', function($scope, mBaasService) {
    $scope.settings.isHiddenTab = false;
    $scope.user = {};
    $scope.isLogin = false;
    var current = mBaasService.getCurrentUser();
    if (current) {
        var ncmb = mBaasService.getNcmb();
        mBaasService.login(current.mailAddress, current.password);
        $scope.$on('auto_login', function(event, data) {
            $scope.$apply(function () {
                $scope.user.username = data;
                ncmb.User.logout();
                $scope.isLogin = true;
            });
        });
    } else {
        $scope.user.username = 'ゲスト';
    }
});
app.controller('loginCtrl', function($scope, mBaasService) {
    $scope.signIn = function() {
        mBaasService.login($scope.login.email, $scope.login.password);
        navigator.pushPage('top.html');
    }
});
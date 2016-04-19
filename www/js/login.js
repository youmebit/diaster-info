'use strict';
app.controller('loginCtrl', function($scope, mBaasService) {
    $scope.signIn = function() {
		if (!confirm('ログインしてもよろしいでしょうか？')) {
			return;
		}
        mBaasService.login($scope.login.email, $scope.login.password);
		$scope.$on('login_complate', function(event, data) {
			alert('ログインしました。');
			myNavigator.pushPage('top.html');
		});
    }
});
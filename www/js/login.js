'use strict';
app.controller('loginCtrl', function($scope, mBaasService) {
    $scope.signIn = function() {
		if (!confirm('ログインしてもよろしいですか？')) {
			return;
		}
        mBaasService.login($scope.login.email, $scope.login.password);
		$scope.$on('login_complate', function(event, data) {
			$scope.user.username = data;
			$scope.user.isLogin = true;
			$scope.toHome();
		});
    }
});
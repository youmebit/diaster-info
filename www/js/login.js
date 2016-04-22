'use strict';
app.controller('loginCtrl', function($scope, $rootScope, mBaasService) {
    $scope.signIn = function() {
		if (!confirm('ログインしてもよろしいですか？')) {
			return;
		}
        mBaasService.loginAsEmail($scope.login.email, $scope.login.password);
		$scope.$on('login_complate', function(event, data) {
			$rootScope.user.username = data.userName;
			$rootScope.user.isLogin = true;
			$rootScope.user.role = data.role;
			$scope.toHome();
		});
    }
});
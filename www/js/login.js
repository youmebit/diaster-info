'use strict';
app.controller('loginCtrl', function($scope, Current, dialogService, mBaasService) {
    $scope.signIn = function() {
		dialogService.confirm('ログインしてもよろしいですか？');
		$scope.$on('confirm:ok', function() {
			mBaasService.loginAsEmail($scope.login.email, $scope.login.password);
			$scope.$on('login_complate', function(event, data) {
				Current.setCurrent(data.userName, true, data.role);
				$scope.toHome();
			});
		});
    }
});
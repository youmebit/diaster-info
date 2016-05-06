'use strict';
app.controller('userCtrl', function ($scope, role, dialogService, mBaasService, ErrInterceptor) {
    $scope.user = {};
    $scope.signUp = function () {
		dialogService.confirm('登録してもよろしいですか?');
		$scope.$on('confirm:ok', function() {
			// 会員追加
			var ncmb = mBaasService.getNcmb();
			var user = new ncmb.User();
			user.set("userName", $scope.signup.username)
				.set("password", $scope.signup.password)
				.set("mailAddress", $scope.signup.email)
				.set("role", role.member);
			user.signUpByAccount()
			.then(function () {
				myNavigator.pushPage('user/regist_info.html');
			})
			.catch(function (err) {
                ErrInterceptor.responseErr(err);
                $scope.$on('process:fail', function(event, err) {
        			if (err.status == 409) {
                        dialogService.error('会員名もしくはメールアドレスが既に登録されています。');
    				}
                });
			});
		});
    }
});
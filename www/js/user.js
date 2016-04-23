'use strict';
app.controller('userCtrl', function ($scope, role, dialogService, mBaasService) {
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
				console.log(JSON.stringify(err));
				if (err.status == 409) {
					fail('会員名もしくはメールアドレスが既に登録されています。');
				}
			});

			var fail = function(message) {
				alert(message);
			}
		});
    }
});
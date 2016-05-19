'use strict';
app.controller('userCtrl', function ($scope, role, dialogService, users) {
    $scope.user = {};
    $scope.signUp = function () {
		var add = function() {
            var ok = function() {
    			myNavigator.pushPage('user/regist_info.html');
            };
            var fail = function(err) {
        		if (err.status == 409) {
                    dialogService.error('会員名もしくはメールアドレスが既に登録されています。');
				}
            };
            users.add($scope.signup, ok, fail);
		};
    	dialogService.confirm('登録してもよろしいですか?', add);
    }
});
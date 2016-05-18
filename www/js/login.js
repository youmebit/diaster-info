'use strict';
app.controller('loginCtrl', function($scope, Current, users, dialogService) {
    $scope.signIn = function() {
        var login = function() {
            var ok = function(data) {
                console.log(Current.getCurrent());
    			Current.setCurrent(data, true);
				$scope.toHome();
                $scope.$emit('toHome:success', 'ログインしました');
            }
            
            var fail = function(err) {
                var msg = 'ログインに失敗しました。';
                if (err.status == '401') {
                    msg = 'メールアドレスもしくはパスワードが違います。';
                }
                event.preventDefault();
                dialogService.error(msg);
            };
        	users.loginAsEmail($scope.login.email, $scope.login.password, ok, fail);
		};
        
    	dialogService.confirm('ログインしてもよろしいですか？', login);
    }
});

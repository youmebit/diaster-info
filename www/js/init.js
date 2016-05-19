'use strict';

app.controller('bodyCtrl', function($scope, $rootScope, Current, authService, tabService, dialogService, users, posts) {
	$scope.topInit = function() {
            $scope.$apply(function() {
				$rootScope.displayPage = 'list_ghest';
				if (Current.isLogin()) {
					$rootScope.displayPage = 'list_select';
				}
        		$rootScope.user = Current.getCurrent();

				// // 対応完了のお知らせを取得
				// $scope.isLoad = false;
				// var dataStore = posts.getPosts().equalTo("correspond", "2").limit(5);
				// var promise = posts.findAsync(dataStore);
				// promise.then(function(results){
				// 	//成功時
				// 	$scope.items = results;
				// 	$scope.isLoad = true;
				// });
		});
	}
    $scope.$on("autologin:success", function(event, data) {
    	$scope.$apply(function() {
            Current.setCurrent(data, data.mailAddress != null);
			$rootScope.user = Current.getCurrent();
    	});
    });

	$scope.toHome = function() {
        tabService.setActiveTab(0);
    }

	$scope.toDisplayPage = function() {
		tabService.setActiveTab(2);
	}

    $scope.toLoginPage = function() {
        tabService.setActiveTab(3);
    }

    $scope.toPostPage = function() {
        if (!navigator.geolocation) {
            dialogService.error('位置情報が取得できないため、この機能は使用できません。');
        } else if (!$rootScope.settings.isDebug) {
								dialogService.error('宝塚市内ではないため投稿できません');
				} else {
					tabService.setActiveTab(1);
				}
    }

		$scope.toDetail = function (objectId) {
			myNavigator.pushPage('display/detail.html', {id : objectId});

		}

		$scope.signOut = function() {
            var signOut = function() {
                var ok = function() {
    				Current.initialize();
					//　初回起動(匿名ユーザー登録)
					users.loginAsAnonymous();
					$scope.topInit();
					$scope.$emit('toHome:success', 'ログアウトしました');
                }
                users.logout(ok);
            }
			dialogService.confirm('ログアウトしてもよろしいですか？', signOut);
		}

		// トップ画面を初期化した後にダイアログ表示。
		$scope.$on('toHome:success', function(event, msg) {
			dialogService.complete(msg);
		});
});

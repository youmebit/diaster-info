'use strict';

app.controller('bodyCtrl', function($scope, $rootScope, Current,
				tabService, dialogService, users, posts, RequestService) {
	$scope.topInit = function() {
			$scope.list_error = '';
            $scope.$apply(function() {
				$rootScope.displayPage = 'list_ghest';
				if (Current.isLogin()) {
					$rootScope.displayPage = 'list_select';
				}
        		$rootScope.user = Current.getCurrent();

				// 対応完了のお知らせを取得
				$scope.isLoad = false;
				var dataStore = posts.getPosts().equalTo("correspond", "2").limit(5);
				var lineFail = function() {
					$scope.list_error = '電波が届かないため表示できません';
					$scope.items = [];
					$scope.isLoad = true;
				};
				var success = function() {
					var promise = posts.findAsync(dataStore);
					promise.then(function(results){
						//成功時
						if (results.length == 0) {
							$scope.list_error = '表示する情報がありません';
						} else {
							$scope.items = results;
						}
						$scope.isLoad = true;
					});
				};
				RequestService.request(success, lineFail);
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
		var fail = function() {
			dialogService.line_off();
		};
		RequestService.request(function() {tabService.setActiveTab(2);}, fail);
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
			var fail = function() {
				dialogService.line_off();
			};
			RequestService.request(function() {myNavigator.pushPage('display/detail.html', {id : objectId});}, fail);
		}

		$scope.signOut = function() {
            var signOut = function() {
                var ok = function() {
    				Current.initialize();
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

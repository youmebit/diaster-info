'use strict';

app.controller('bodyCtrl', function($scope, $rootScope, Current,
				tabService, dialogService, users, posts, RequestService, tabIndex) {
	ons.ready(function() {
		tabbar.on('prechange', function(event) {
			if (JSON.stringify(event.index) == tabIndex.post) {
				var msg;
		        if (!navigator.geolocation) {
		        	msg = '位置情報が取得できないため、この機能は使用できません。';
		        } else if (!$rootScope.settings.isDebug) {
		        	msg = '宝塚市内ではないため投稿できません';
				}
				if (msg) {
		            dialogService.error(msg);
		            event.cancel();
				}
			}
		});
	});
					
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
        tabService.setActiveTab(tabIndex.home);
    }

	$scope.toDisplayPage = function() {
		var fail = function() {
			dialogService.line_off();
		};
		RequestService.request(function() {tabService.setActiveTab(tabIndex.list);}, fail);
	}

    $scope.toLoginPage = function() {
        tabService.setActiveTab(tabIndex.login);
    }

    $scope.toPostPage = function() {
		tabService.setActiveTab(tabIndex.post);
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

'use strict';

app.controller('bodyCtrl', function($scope, $rootScope, Current,
				tabService, dialogService, users, posts, RequestService, geoService, tabIndex, filterFilter) {
	$rootScope.post_error = '';
	ons.ready(function() {
		tabbar.on('prechange', function(event) {
			if (JSON.stringify(event.index) == tabIndex.post) {
				console.log($rootScope.post_error);
				if ($rootScope.post_error) {
					var err = filterFilter($rootScope.errors, function(obj) {
						return obj.key == $rootScope.post_error;
					});
		            dialogService.error(err[0].msg);
		            event.cancel();
		            $rootScope.post_error = '';
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

				var success = function(point) {
					if (!$rootScope.settings.isDebug) {
						console.log(111);
						var isTarget = false;
						angular.forEach(point.address, function (a) {
							if (a.long_name.indexOf('宝塚市') != -1) {
								isTarget = true;
							}
						});
						if (!isTarget) {
							$rootScope.post_error = 'outOfArea';
						}
					}
				};
		
				var fail = function(error) {
					$rootScope.post_error = 'cannotGeocode';
				};
				if (!navigator.geolocation) {
					console.log(111);
				}
				geoService.currentPosition(success, fail);

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

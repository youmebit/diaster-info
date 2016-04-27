'use strict';

var app = angular.module('myApp', ['onsen.directives', 'ngMessages']);
app.run(function($rootScope, Current, users, tabService) {
	$rootScope.settings = {
		isHideTabbar : false
	};

	// 一覧ページの遷移先
	Current.initialize();
	var strage = users.getCurrentUser();
	if (strage) {
//			匿名ユーザー判定
		if (strage.mailAddress) {
			users.loginAsName(strage.userName, strage.password);
			$rootScope.$on('login_complate', function(event, data) {
				Current.setCurrent(data, true);
			});
		} else {
			users.loginAsAnonymous(strage.authData.anonymous.id);
		}
	} else {
		//　初回起動(匿名ユーザー登録)
		users.loginAsAnonymous();
	}

	$rootScope.errors = [
      { key: 'required', msg: '必ず入力してください' },
      { key: 'email', msg: 'メールアドレスではありません' },
        {key: 'match', msg: 'パスワードが一致しません'},
        {key: 'passType', msg:'アルファベットと数字のみを入力してください'},
        {key: 'nameLength', msg:'16文字以下で入力してください'},
        {key: 'emailLength', msg:'256文字以下で入力してください'},
        {key: 'passLength', msg:'6文字以上16文字以下で入力してください'}
    ];

	tabService.setActiveTab(0);
});

app.controller('bodyCtrl', function($scope, $rootScope, Current, tabService, dialogService, users, posts, geoService) {
	$scope.topInit = function() {
		$scope.$apply(function() {
				$rootScope.displayPage = 'list_ghest';
				$rootScope.user = Current.getCurrent();
				if (Current.isLogin()) {
					$rootScope.displayPage = 'list_select';
				}

				// 対応完了のお知らせを取得
				$scope.isLoad = false;
				var dataStore = posts.getPosts().equalTo("correspond", "2").limit(5);
				var promise = posts.findAsync(dataStore);
				promise.then(function(results){
					//成功時
					$scope.items = results;
					$scope.isLoad = true;
				});
		});
	}

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
        } else {
					var canPost = false;
						geoService.currentPosition();
						$scope.$on("geocode:success", function(event, point) {
							angular.forEach(point.address, function (a) {
									if (a.long_name.indexOf('宝塚市') != -1) {
											canPost = true;
									}
							});
							if (!canPost) {
								dialogService.error('宝塚市内ではないため投稿できません');
							} else {
								tabService.setActiveTab(1);
							}
						});
        }
    }

		$scope.toDetail = function (objectId) {
			myNavigator.pushPage('display/detail.html', {id : objectId});

		}

		$scope.signOut = function() {
			dialogService.confirm('ログアウトしてもよろしいですか？');
			$scope.$on('confirm:ok', function() {
				users.logout();
				$scope.$on('logout:success', function(event) {
					Current.initialize();
					//　初回起動(匿名ユーザー登録)
					users.loginAsAnonymous();
					$scope.topInit();
					$scope.$emit('toHome:success', 'ログアウトしました');
				});
			});
		}

		// トップ画面を初期化した後にダイアログ表示。
		$scope.$on('toHome:success', function(event, msg) {
			dialogService.complete(msg);
		});
});

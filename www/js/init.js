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
				Current.setCurrent(data.userName, true, data.role, data.objectId);
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
        {key: 'compareTo', msg: 'パスワードが一致しません'},
        {key: 'passType', msg:'アルファベットと数字のみを入力してください'},
        {key: 'nameLength', msg:'16文字以下で入力してください'},
        {key: 'emailLength', msg:'256文字以下で入力してください'},
        {key: 'passLength', msg:'6文字以上16文字以下で入力してください'}
    ];

	tabService.setActiveTab(0);
});

app.controller('bodyCtrl', function($scope, $rootScope, Current, tabService, dialogService, users) {
	$scope.topInit = function() {
		$scope.$apply(function() {
				$rootScope.displayPage = 'list_ghest';
				$rootScope.user = Current.getCurrent();
				if (Current.isLogin()) {
					$rootScope.displayPage = 'list_select';
				}
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
            alert('位置情報が取得できないため、この機能は使用できません。');
        } else {
            tabService.setActiveTab(1);
        }
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
			});
		});
	}
});

// 位置情報から住所を取得するサービス
app.service('geoService', function() {
    this.loadAddress = function(latitude, longitude, onSuccess) {
        var geocoder = new google.maps.Geocoder();
        // 入力された緯度経度取得
        var latlng = new google.maps.LatLng(latitude, longitude);
        geocoder.geocode({
            'latLng': latlng
        }, function (results, status) {

            // ステータスがOK（成功）
            if (status == google.maps.GeocoderStatus.OK) {
                onSuccess(latitude, longitude, results[0].address_components);
            } else {
                console.log('位置情報取得ステータス:' + status);
                alert("位置情報の取得に失敗しました。申し訳ありませんがもう一度送信してください。");
            }
        });
    }
    this.currentPosition = function(onSuccess) {
                    // 住所を取得する
        var geoOptions = {
            maximumAge: 3000,
            timeout: 4000,
            enableHighAccuracy: true
        };

        // 現在位置を取得する。
        navigator.geolocation.getCurrentPosition(function (position) {
            var onGeoSuccess = function(latitude, longitude, components) {
                var longAddress = "";
                var isAppend = true;
                angular.forEach(components, function (address) {
                    if (address.long_name.indexOf('市') != -1) {
                        isAppend = false;
                    }
                    if (isAppend) {
                        longAddress = address.long_name + longAddress;
                    }
                });

                myNavigator.pushPage('post.html', {
                    image: "data:image/jpeg;base64," + imageURI,
                    address: longAddress,
                    latitude: latitude,
                    longitude: longitude
                });
            }

            // 住所を取得する。
            geoService.loadAddress(position.coords.latitude, position.coords.longitude, onGeoSuccess);
            },
            function (error) {
                var errorMessage = {
                    0: "原因不明のエラーが発生しました。",
                    1: "位置情報の取得が許可されませんでした。",
                    2: "電波状況などで位置情報が取得できませんでした。",
                    3: "位置情報の取得に時間がかかり過ぎてタイムアウトしました。",
                };

                // エラーコードに合わせたエラー内容をアラート表示
                alert(errorMessage[error.code]);
                modal.hide();
            }, geoOptions);
    }
});

app.constant('role', {
			 	'member' : '0',
			 	'staff' : '1'
});

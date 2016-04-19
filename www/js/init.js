'use strict';

var app = angular.module('myApp', ['onsen.directives', 'ngMessages']);

app.controller('bodyCtrl', function($scope, mBaasService, tabService) {
    $scope.settings = {};
    $scope.errors = [
      { key: 'required', msg: '必ず入力してください' },
      { key: 'email', msg: 'メールアドレスではありません' },
        {key: 'compareTo', msg: 'パスワードが一致しません'},
        {key: 'passType', msg:'アルファベットと数字のみを入力してください'},
        {key: 'nameLength', msg:'16文字以下で入力してください'},
        {key: 'emailLength', msg:'256文字以下で入力してください'},
        {key: 'passLength', msg:'6文字以上16文字以下で入力してください'}
    ];
    tabService.setActiveTab(0);
    $scope.settings.isHideTabbar = false;
    
    // トップ画面初期化
    $scope.topInit = function() {
        $scope.user = {};
        $scope.settings.isLogin = false;
		$scope.user.username = 'ゲスト';
		
        var current = mBaasService.getCurrentUser();
        var ncmb = mBaasService.getNcmb();
        if (current) {
			
			// 匿名ユーザー判定
			if (!current.authData.anonymous) {
				mBaasService.login(current.mailAddress, current.password);
				$scope.$on('auto_login', function(event, data) {
					$scope.$apply(function () {
						$scope.user.username = data;
						ncmb.User.logout();
						$scope.settings.isLogin = true;
					});
				});
			}
        } else {
			//　初回起動(匿名ユーザー登録)
			ncmb.User.loginAsAnonymous();
        }
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
	
	$scope.toListPage = function() {
		console.log('aaa');
	}
});

// ｍBaaS接続サービス
app.service('mBaasService', function ($rootScope) {
    var ncmb = null;
    this.getNcmb = function () {
        if (!ncmb) {
            var APP_KEY = '536ea833c07c98ed2cf1b836739a9729ad7544fc3a9e282e875f99e93bd8eb47';
            var CLIENT_KEY = 'c47f0f99bc98940357aeb142158515adbca19f165f49b579f1cce020a3135583';
            ncmb = new NCMB(APP_KEY, CLIENT_KEY);
        }
        return ncmb;
    }
    
    this.hasCurrent = function() {
        var user = this.getCurrentUser();
        return user != null;
    }
    
    this.getCurrentUser = function() {
        return this.getNcmb().User.getCurrentUser();
    }
    
    this.login = function(address, password) {
        var ncmb = this.getNcmb();
        ncmb.User.loginWithMailAddress(address, password).then(function(data) {
            $rootScope.$broadcast('auto_login', data.userName);
        })
        .catch(function(err){
            alert('ログインに失敗しました。');
            console.log(err);
        });
    }
});

// タブバーの番号を設定するとそのページに遷移するサービス
app.service('tabService', function(){
    this.setActiveTab = function(index) {
        setImmediate(function() {
            tabbar.setActiveTab(index);
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


// htmlタグに'hide-tabbar'をつけるとタップした時にタブバーを非表示にする。
app.directive('hideTabbar', function($timeout) {
    return {
        link : function(scope, element, attrs) {
            element.bind('focus', function(e) {
                $timeout(function(){
                    scope.$apply(tabbar.setTabbarVisibility(false));
                });
            });
            element.bind('blur', function(e) {
                $timeout(function(){
                    scope.$apply(tabbar.setTabbarVisibility(true));
                });
            });
        }
    }
});

// 入力値2つを比較するバリデーション
app.directive("compareTo", function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {
             
            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };
 
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
});

// パスワードの文字数をチェックするバリデーション
app.directive('nameLength',function(){
    return{
        restrict: "A",
        require: "ngModel",
        link: function(scope,element,attrs,ngModel){
            ngModel.$validators.nameLength = function(modelValue){
                if (modelValue) {
                    return modelValue.length <= 16;
                }
            };
            
            scope.$watch("modelValue", function() {
                ngModel.$validate();
            });
        }
    }
});

// パスワードの文字数をチェックするバリデーション
app.directive('emailLength',function(){
    return{
        restrict: "A",
        require: "ngModel",
        link: function(scope,element,attrs,ngModel){
            ngModel.$validators.emailLength = function(modelValue){
                if (modelValue) {
                    return modelValue.length <= 256;
                }
            };
            
            scope.$watch("modelValue", function() {
                ngModel.$validate();
            });
        }
    }
});

// パスワードの文字種をチェックするバリデーション
app.directive('passType',function(){
    return{
        restrict: "A",
        require: "ngModel",
        link: function(scope,element,attrs,ngModel){
            ngModel.$validators.passType = function(modelValue){
                if (modelValue) {
                    return /^[0-9a-zA-Z]+$/.test(modelValue);
                }
            };
            
            scope.$watch("modelValue", function() {
                ngModel.$validate();
            });
        }
    }
});

// パスワードの文字数をチェックするバリデーション
app.directive('passLength',function(){
    return{
        restrict: "A",
        require: "ngModel",
        link: function(scope,element,attrs,ngModel){
            ngModel.$validators.passLength = function(modelValue){
                if (modelValue) {
                    return modelValue.length >= 6 && modelValue.length <= 16;
                }
            };
            
            scope.$watch("modelValue", function() {
                ngModel.$validate();
            });
        }
    }
});
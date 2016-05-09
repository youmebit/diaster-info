'use strict';

var app = angular.module('myApp', ['onsen.directives', 'ngMessages']);
app.constant('role', {
    		 	'member' : '0',
			 	'staff' : '1'
});

// mBaaS接続サービス
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
});

// タブバーの番号を設定するとそのページに遷移するサービス
app.service('tabService', function(){
    this.setActiveTab = function(index) {
        setImmediate(function() {
            tabbar.setActiveTab(index);
        });
    }
});
app.service('dialogService', function($rootScope){
	this.complete = function(msg) {
		ons.createAlertDialog('template/dialog.html', {parentScope: $rootScope}).then(function(dialog) {
			$rootScope.msg = msg;
			$rootScope.dialogTitle = "OK";
			alertDialog.show();
		});
	},
	this.error = function (msg) {
		ons.createAlertDialog('template/dialog.html', {parentScope: $rootScope}).then(function(dialog) {
			$rootScope.msg = msg;
			$rootScope.dialogTitle = "申し訳ありません";
			alertDialog.show();
		});
	}
	this.confirm = function(msg) {
		ons.notification.confirm({
			title:'確認',
			message: msg,
			primaryButtonIndex: 1,
			cancelable:true,
			callback: function(answer) {
				if (answer == 1) {
					$rootScope.$broadcast('confirm:ok');
				}
			}
	  });
	}
});

// NCMBでエラーが発生したときのInterceptor
app.factory('ErrInterceptor', function($rootScope, $filter, dialogService) {
    return {
        responseErr : function (err) {
            if (!err.status) {
        		$rootScope.$broadcast('line:off', err);
            } else {
    			$rootScope.$broadcast('process:fail', err);
            }
        }
    }
});

app.factory('Current', function(){
	var current = {};
	return {
		setCurrent : function(user, isLogin) {
				this.current = {
					username : user.userName,
					isLogin : isLogin,
					role : user.role,
					objectId : user.objectId
				};
		},
		getCurrent : function() {
			return this.current;
		},
		initialize : function() {
				this.current = {
					username : 'ゲスト',
					isLogin : false,
					role : 0,
					objectId : ''
				};
		},
		isLogin : function() {
          return this.current.isLogin;
        }
	}
});

// Usersデータストア
app.factory('users', function($rootScope, mBaasService, ErrInterceptor) {
	return {
		hasCurrent : function() {
			var user = this.getCurrentUser();
			return user != null;
		},
		getCurrentUser : function() {
			return mBaasService.getNcmb().User.getCurrentUser();
		},
		// メールアドレスとパスワードでログイン
		loginAsEmail: function (address, password) {
			var ncmb = mBaasService.getNcmb();
			ncmb.User.loginWithMailAddress(address, password).then(function (data) {
					$rootScope.$broadcast('login_complate', data);
				})
				.catch(function (err) {
                    ErrInterceptor.responseErr(err);
				});
		},
		// 名前とパスワードでログイン
		loginAsName : function(name, password) {
			mBaasService.getNcmb().User.login(name, password)
				.then(function(data) {
					$rootScope.$broadcast('login_complate', data);
				})
			.catch(function(err){
                ErrInterceptor.responseErr(err);
			});
		},
		loginAsAnonymous : function(uuid) {
			mBaasService.getNcmb().User.loginAsAnonymous(uuid);
		},
		reset : function(mailAddress) {
				var ncmb = mBaasService.getNcmb();
				var current = new ncmb.User();
				current.set("mailAddress", mailAddress);
				current.requestPasswordReset(function(data) {
					$rootScope.$broadcast("reset:success");
				});
		},
		logout : function() {
			var ncmb = mBaasService.getNcmb();
			ncmb.User.logout().then(function(){
				$rootScope.$broadcast('logout:success');
			});
		}
	}
});

// Postsデータストア
app.factory('posts', function(mBaasService, $q, $timeout, ErrInterceptor) {
	return {
		findById : function(id, success) {
			var Posts = this.getPosts();
			Posts.equalTo("objectId", id).fetch().then(function(result) {
				success(result);
			});
		},

    find : function(dataStore, success) {
        dataStore.order("updateDate", true).fetchAll().then(function(results) {
          success(results);
        });
    },
    // 非同期でデータを取得する
    findAsync : function(dataStore) {
        var d = $q.defer();
        $timeout(function(){
            dataStore.order("updateDate", true).fetchAll().then(function(results) {
              d.resolve(results);
              //プロミスオブジェクトを参照もとに返す
              return d.promise;
            }).catch(function(err) {
                ErrInterceptor.responseErr(err);
            });
        }, 2000);

        //プロミスオブジェクトを参照もとに返す
        return d.promise;
    },

    getPosts : function() {
        var ncmb = mBaasService.getNcmb();
    		return ncmb.DataStore("Posts");
          }
	};
});

// 位置情報から住所を取得するサービス
app.service('geoService', function($rootScope, dialogService) {
	// 入力された緯度経度から取得
    this.loadAddress = function(latitude, longitude) {
    },
		// 現在位置から位置情報と住所を取得する。
	  this.currentPosition = function() {
			var geoOptions = {
					maximumAge: 5000,
					timeout: 6000,
					enableHighAccuracy: true
			};
			navigator.geolocation.getCurrentPosition(function (position) {
					var geocoder = new google.maps.Geocoder();
					var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					geocoder.geocode({
							'latLng': latlng
					}, function (results, status) {
							// ステータスがOK（成功）
							if (status == google.maps.GeocoderStatus.OK) {
									var point = {
										lat:position.coords.latitude,
										long:position.coords.longitude,
										address:results[0].address_components
									};
									$rootScope.$broadcast("geocode:success", point);
							} else {
									console.log('位置情報取得ステータス:' + status);
									dialogService.error("位置情報の取得に失敗しました。申し訳ありませんがもう一度送信してください。");
							}
					});

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
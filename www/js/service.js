'use strict';

// ユーザー種別
app.constant('role', {
    		 	'member' : '0',
			 	'staff' : '1'
});

// タブ番号
app.constant('tabIndex', {'home' : 0, 'post' : 1,
'list' : 2, 'login' : '3'});

// 認証サービス
app.service('authService', function(users, $rootScope, Current) {
    var limitSeconds = 1000 * 60 * 60 * 24;

    var UserType = function(_strage_) {
        this.strage = _strage_;
    };
    // 一般ユーザー
    UserType.prototype = {
        login : function(ok) {
          users.loginAsAnonymous(this.strage.authData.anonymous.id, ok);
        },
        getUserName : function() {
            return 'ゲスト';
        }
    };
    // 会員
    var Member = function(_strage_) {
        this.strage = _strage_;
    };
    Member.prototype = new UserType();

    Member.prototype.login = function(ok) {
        users.loginAsEmail(this.strage.mailAddress, this.strage.password, ok);
    }

    Member.prototype.getUserName = function() {
        return this.strage.username;
    }

    this.autoLogin = function(isCondition) {
        var current = Current.getCurrent();
        var userType;
        if (current.role) {
            userType = new Member(current);
        } else {
            userType = new UserType(current);
        }
        isCondition(current);
        $rootScope.$on("need:login", function(event, current) {
            var ok = function(data) {
              data.userName = userType.getUserName();
              if (!data.updateDate) {
                  var now = new Date();
                  data.updateDate = now.toISOString();
              }
              $rootScope.$broadcast("autologin:success", data);
            }
          userType.login(ok);
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

app.factory('dialogService', function($rootScope, RequestService){
    return {
        complete : function(msg) {
        	ons.createAlertDialog('template/dialog.html', {parentScope: $rootScope}).then(function(dialog) {
    			$rootScope.msg = msg;
    			$rootScope.dialogTitle = "OK";
    			alertDialog.show();
    		});
        },
        error : function(msg) {
        	ons.createAlertDialog('template/dialog.html', {parentScope: $rootScope}).then(function(dialog) {
            	$rootScope.msg = msg;
    			$rootScope.dialogTitle = "申し訳ありません";
    			alertDialog.show();
    		});
        },
        confirm : function(msg, success) {
        	ons.notification.confirm({
    			title:'確認',
    			message: msg,
    			primaryButtonIndex: 1,
    			cancelable:true,
    			callback: function(answer) {
    				if (answer == 1) {
    					var fail = function() {
				        	ons.createAlertDialog('template/dialog.html', {parentScope: $rootScope}).then(function(dialog) {
				          $rootScope.msg = "電波の届くところでもう一度やり直してください";
				    			$rootScope.dialogTitle = "申し訳ありません";
				    			alertDialog.show();
				    		});
    					};
    					RequestService.request(success, fail);
    				}
    			}
    	  });
        },
        line_off : function() {
        	this.error("電波の届くところでもう一度やり直してください");
        }
    }
});

// 電波状況チェックを行うサービス
app.factory('RequestService', function($rootScope) {
    return {
        request : function (success, fail) {
        	// var networkState = navigator.connection.type;
        	// if (networkState == "none") {
        	// 	fail();
        	// } else {
         //        success();
        	// }
            success();
        }
    }
});

app.factory('Current', function(){
	var current = {};
	return {
		setCurrent : function(user, isLogin) {
				this.current = {
					username : user.userName,
                    mailAddress : user.mailAddress,
                    password : user.password,
					isLogin : isLogin,
					role : user.role,
					objectId : user.objectId,
                    authData : user.authData
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
					objectId : '',
                    updateDate : new Date()
				};
		},
        setUpdateDate : function(updateDate) {
            this.current.updateDate = updateDate;
        },
        getUpdateDate : function() {
          return this.current.updateDate;
        },
		    isLogin : function() {
          return this.current.isLogin;
        }
	}
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

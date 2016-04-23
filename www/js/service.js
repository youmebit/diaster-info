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
			$rootScope.type = "msg_info";
			alertDialog.show();
		});
	},
	this.error = function () {
		ons.createAlertDialog('template/dialog.html', {parentScope: $rootScope}).then(function(dialog) {
			$rootScope.msg = msg;
			$rootScope.type = "msg_error";
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

app.factory('Current', function(){
	var current = {};
	return {
		setCurrent : function(username, isLogin, role, objectId) {
			this.current = {
				username : username,
				isLogin : isLogin,
				role : role,
				objectId : objectId
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
		}
	}
});

// Usersデータストア
app.factory('users', function($rootScope, mBaasService) {
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
					alert('メールアドレスもしくはパスワードが違います。');
				});
		},
		// 名前とパスワードでログイン
		loginAsName : function(name, password) {
			mBaasService.getNcmb().User.login(name, password)
				.then(function(data) {
					$rootScope.$broadcast('login_complate', data);
				})
			.catch(function(err){
				alert('ログインに失敗しました。');
			});
		},
		loginAsAnonymous : function(uuid) {
			mBaasService.getNcmb().User.loginAsAnonymous(uuid);
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
app.factory('posts', function(mBaasService) {
	return {
		findById : function(id, success) {
			var Posts = getPosts();
			Posts.equalTo("objectId", id).fetch().then(function(result) {
				success(result);
			});
		},
		findAll : function(success) {
			var Posts = getPosts();
			Posts.order("updateDate", true).fetchAll().then(function(results) {
				success(results);
			});
		},
		findByUserId : function(id, success) {
			var Posts = getPosts();
			Posts.equalTo("userID", id).order("updateDate", true).fetchAll().then(function(results) {
				success(results);
			});
		},
	};

	function getPosts() {
		var ncmb = mBaasService.getNcmb();
		return ncmb.DataStore("Posts");
	}
});
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
    
    this.hasCurrent = function() {
        var user = this.getCurrentUser();
        return user != null;
    }
    
    this.getCurrentUser = function() {
        return this.getNcmb().User.getCurrentUser();
    }
    
    this.loginAsEmail = function(address, password) {
        var ncmb = this.getNcmb();
        ncmb.User.loginWithMailAddress(address, password).then(function(data) {
            $rootScope.$broadcast('login_complate', data);
        })
        .catch(function(err){
            alert('メールアドレスもしくはパスワードが違います。');
        });
    }
	
	this.loginAsName = function(name, password) {
		ncmb.User.login(name, password).then(function(data) {
			$rootScope.$broadcast('login_complate', data);
		})
        .catch(function(err){
            alert('ログインに失敗しました。');
        });
	}
	this.loginAsAnonymous = function(uuid) {
		this.getNcmb().User.loginAsAnonymous(uuid);
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
		setCurrent : function(username, isLogin, role) {
			this.current = {
				username : username,
				isLogin : isLogin,
				role : role
			};
		},
		getCurrent : function() {
			return this.current;
		},
		initialize : function() {
			this.current = {
				username : 'ゲスト',
				isLogin : false,
				role : 0
			};
		}
	}
});

app.factory('users', function() {
	
});

// Postsデータストア
app.factory('posts', function($rootScope, mBaasService) {
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
	};

	function getPosts() {
		var ncmb = mBaasService.getNcmb();
		return ncmb.DataStore("Posts");
	}
});
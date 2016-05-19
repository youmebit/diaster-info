'use strict';


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


// Usersデータストア
app.factory('users', function($rootScope, mBaasService, ErrInterceptor, role) {
	return {
		hasCurrent : function() {
			var user = this.getCurrentUser();
			return user != null;
		},
		getCurrentUser : function() {
			return mBaasService.getNcmb().User.getCurrentUser();
		},
		// メールアドレスとパスワードでログイン
		loginAsEmail: function (address, password, ok, fail) {
			var ncmb = mBaasService.getNcmb();
			ncmb.User.loginWithMailAddress(address, password).then(function (data) {
					ok(data);
				})
				.catch(function(err) {
    			    ErrInterceptor.responseErr(err, fail);
				});
		},
		loginAsAnonymous : function(uuid, ok) {
			mBaasService.getNcmb().User.loginAsAnonymous(uuid).then(function(data) {
                ok(data);
			});
		},
        // 会員追加
        add : function(signup, ok, fail) {
			var ncmb = mBaasService.getNcmb();
			var user = new ncmb.User();
			user.set("userName", signup.username)
				.set("password", signup.password)
				.set("mailAddress", signup.email)
				.set("role", role.member);
			user.signUpByAccount()
			.then(function () {
                ok();
			})
			.catch(function (err) {
                ErrInterceptor.responseErr(err, fail);
			});
        },
        addAsAnonymous : function() {
            mBaasService.getNcmb().User.loginAsAnonymous();
        },
        reset : function(mailAddress) {
				var ncmb = mBaasService.getNcmb();
				var current = new ncmb.User();
				current.set("mailAddress", mailAddress);
				current.requestPasswordReset(function(data) {
					$rootScope.$broadcast("reset:success");
				});
		},
		logout : function(ok) {
			var ncmb = mBaasService.getNcmb();
			ncmb.User.logout().then(function(){
				//　匿名ユーザー再登録
                mBaasService.getNcmb().User.loginAsAnonymous().then(function(data) {
                    ok();
                });
			});
		},
        find : function(username) {
    		var ncmb = mBaasService.getNcmb();
            ncmb.User.equalTo("userName", username).fetch().then(function(data) {
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
	    },
			    
	    postInfo : function(piece, fileName, saveSuccess, onFail) {
	    	var Posts = this.getPosts();
	    	var data = new Posts();
  			data.set("userID", piece.userId);
  			data.set("username", piece.name);
  			data.set("photo", fileName);
  			data.set("address", piece.address);
  			data.set("comment", piece.comment);
  			var ncmb = mBaasService.getNcmb();
  			var geopoint = new ncmb.GeoPoint(piece.latitude, piece.longitude);
  			data.set("point", geopoint);
  			data.set("correspond", 0);
  			data.set("response", null);

  			data.save().then(function (data) {
  				saveSuccess();
  			}).catch(function (err) {
  				onFail(err);
  			});

	    }
	}
});


// ファイルストア
app.factory('fileStore', function(mBaasService) {
    return {
        upload : function(fileName, blob, uploadSuccess, onFail) {
        	console.log(111);
            var ncmb = mBaasService.getNcmb();
            ncmb.File.upload(fileName, blob).then(
  				function (data) {
  					uploadSuccess();
  				}
  			).catch(function (err) {
  				onFail(err);
  			});

        }
    }
});



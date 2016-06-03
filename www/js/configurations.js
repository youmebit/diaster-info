'use strict';
var app = angular.module('myApp', ['onsen.directives', 'ngMessages']);
app.factory('authInterceptor', function($q, $injector, $rootScope) {
    var authInterceptor = {
        request : function(config) {
            var authService = $injector.get('authService');
            var condition = function(current) {
                var limitSeconds = 1000 * 60 * 60 * 24;
                var now = new Date();
                var lastDate = Date.parse(current.updateDate);
                if (lastDate - now.getTime() > limitSeconds) {
                  return true;
                }
                return false;
            };
            authService.autoLogin(condition);
            return config;
        }
    };

    return authInterceptor;
});

app.config(function($httpProvider) {
   $httpProvider.interceptors.push('authInterceptor');
});

app.run(function($rootScope, $http, Current, users, authService, tabService, geoService) {
    $rootScope.errors = [
        { key: 'required', msg: '必ず入力してください' },
        { key: 'email', msg: 'メールアドレスではありません' },
          {key: 'match', msg: 'パスワードが一致しません'},
          {key: 'passType', msg:'アルファベットと数字のみを入力してください'},
          {key: 'nameLength', msg:'16文字以下で入力してください'},
          {key: 'emailLength', msg:'256文字以下で入力してください'},
          {key: 'passLength', msg:'6文字以上16文字以下で入力してください'},
          {key: 'outOfArea', msg:'宝塚市内ではないため投稿できません'},
          {key: 'cannotGeocode', msg:'位置情報が取得できないため、この機能は使用できません。'}
      ];

    tabService.setActiveTab(0);

    $http.get('setting.json').success(function(data) {
  		$rootScope.settings = data;
  		$rootScope.settings.isHideTabbar = false;
  		$rootScope.settings.canPost = false;
  		$rootScope.imgUrl = "https://mb.api.cloud.nifty.com/2013-09-01/applications/" + data.appliID + "/publicFiles"
	});

    // セッション情報の登録
    Current.initialize();
    var strage = users.getCurrentUser();
    if (!strage) {
        users.addAsAnonymous();
    } else {
        var condition = function(current) {
          return true;
        }
        if (strage.mailAddress == null) {
            strage.userName = 'ゲスト';
        }
        Current.setCurrent(strage, angular.isDefined(strage.mailAddress));
        authService.autoLogin(condition);
    }
});

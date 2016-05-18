'use strict';
var app = angular.module('myApp', ['onsen.directives', 'ngMessages']);
app.config(function($httpProvider) {
    $httpProvider.interceptors.push(function ($q, $injector) {
        return {
            request : function(config) {
                // var authService = $injector.get('authService');
                // authService.autoLogin();
                return config;
            }
        }
    });
});

app.run(function($rootScope, $http, Current, users, authService, tabService, geoService) {
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

    $http.get('setting.json').success(function(data) {
      $rootScope.settings = data;
      $rootScope.settings.isHideTabbar = false;
			$rootScope.settings.canPost = false;
			if ($rootScope.settings.isDebug) {
				$rootScope.settings.canPost = true;
			} else {
				geoService.currentPosition();
				$rootScope.$on("geocode:success", function(event, point) {
					angular.forEach(point.address, function (a) {
							if (a.long_name.indexOf('宝塚市') != -1) {
									$rootScope.settings.canPost = true;
							}
					});
				});
			}
	});
    
    // セッション情報の登録
    Current.initialize();
    var strage = users.getCurrentUser();
    if (!strage) {
        users.loginAsAnonymous();
    } else {
        var condition = function() {
            return true;
        }
        Current.setCurrent(strage, angular.isUndefined(strage.mailAddress));
        authService.autoLogin(condition);
    }
});
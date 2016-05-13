'use strict';
var app = angular.module('myApp', ['onsen.directives', 'ngMessages']);
app.config(function($httpProvider) {
    $httpProvider.interceptors.push(function ($q, $injector) {
        return {
            request : function(config) {
                var authService = $injector.get('authService');
                authService.autoLogin();
                return config;
            }
        }
    });
});

app.run(function($rootScope, $http, Current, authService, tabService, geoService) {
    // 一覧ページの遷移先
	Current.initialize();
    authService.autoLogin();
	$rootScope.$on('autologin:success', function(event, data) {
        if (data.role) {
        	Current.setCurrent(data, true);
        }
	});

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
});

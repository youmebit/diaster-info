'use strict';

var app = angular.module('myApp', ['onsen.directives']);
app.controller('bodyCtrl', function($scope, mBaasService, tabService) {
    $scope.settings = {};
    // ログイン機能仮置き
//    mBaasService.login('saltory72@gmail.com', 'password');
    tabService.setActiveTab(0);

    // トップ画面初期化
    $scope.topInit = function() {
        $scope.user = {};
        $scope.settings.isLogin = false;
        
        var current = null;
        if (current) {
            var ncmb = mBaasService.getNcmb();
            mBaasService.login(current.mailAddress, current.password);
            $scope.$on('auto_login', function(event, data) {
                $scope.$apply(function () {
                    $scope.user.username = data;
                    ncmb.User.logout();
                    $scope.settings.isLogin = true;
                });
            });
        } else {
            $scope.user.username = 'ゲスト';
        }
    }
    
    $scope.toLoginPage = function() {
        tabService.setActiveTab(3);
    }
    
    $scope.toPostPage = function() {
        tabService.setActiveTab(1);
    }
});

// ｍBaaS接続サービス
app.service('mBaasService', function ($rootScope) {
    var ncmb = null;
    this.getNcmb = function () {
        if (!ncmb) {
            var APP_KEY = '536ea833c07c98ed2cf1b836739a9729ad7544fc3a9e282e875f99e93bd8eb47';
            var CLIENT_KEY = 'c47f0f99bc98940357aeb142158515adbca19f165f49b579f1cce020a3135583';
//            ncmb = new NCMB(APP_KEY, CLIENT_KEY);
            NCMB.initialize(APP_KEY, CLIENT_KEY);
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
            alert('失敗..');
            console.log(err);
        });
    }
});

app.service('tabService', function(){
    this.setActiveTab = function(index) {
        setImmediate(function() {
            tabbar.setActiveTab(index);
        });
    }
});
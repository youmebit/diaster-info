'use strict';
var app = angular.module('myApp', ['onsen']);
app.controller('bodyCtrl', function($scope, mBaasService) {
    $scope.settings = {};
    $scope.settings.isHiddenTab = false;
    // ログイン機能仮置き
//    mBaasService.login('saltory72@gmail.com', 'password');
    $scope.topInit = function() {
        $scope.settings.isHiddenTab = true;
        $scope.user = {};
        $scope.settings.isLogin = false;
        var current = mBaasService.getCurrentUser();
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
});

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
            alert('失敗..');
            console.log(err);
        });
    }
});

app.controller('tabCtrl', function($scope) {
    $scope.init = function () {
      $scope.tabs = [];
    }
});

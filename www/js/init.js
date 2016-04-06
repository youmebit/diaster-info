'use strict';
var app = angular.module('myApp', ['onsen']);
app.controller('bodyCtrl', function($scope, mBaasService) {
    $scope.settings = {};
    $scope.settings.isHiddenTab = false;
    $scope.isLogin = mBaasService.isLogin();
});

app.service('mBaasService', function () {
    var ncmb = null;
    this.getNcmb = function () {
        if (!ncmb) {
            var APP_KEY = '536ea833c07c98ed2cf1b836739a9729ad7544fc3a9e282e875f99e93bd8eb47';
            var CLIENT_KEY = 'c47f0f99bc98940357aeb142158515adbca19f165f49b579f1cce020a3135583';
            ncmb = new NCMB(APP_KEY, CLIENT_KEY);
        }
        return ncmb;
    }
    
    this.isLogin = function() {
        var user = this.getCurrentUser();
        return user != null;
    }
    
    this.getCurrentUser = function() {
        return this.getNcmb().User.getCurrentUser();
    }
});

app.controller('tabCtrl', function($scope) {
    $scope.init = function () {
      $scope.tabs = [];
    }
});

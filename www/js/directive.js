'use strict';
// 入力値2つを比較するバリデーション
app.directive("compareTo", function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("modelValue", function() {
                ngModel.$validate();
            });

			scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
});

// パスワードの文字数をチェックするバリデーション
app.directive('nameLength',function(){
    return{
        restrict: "A",
        require: "ngModel",
        link: function(scope,element,attrs,ngModel){
            ngModel.$validators.nameLength = function(modelValue){
                if (modelValue) {
                    return modelValue.length <= 16;
                }
            };

            scope.$watch("modelValue", function() {
                ngModel.$validate();
            });
        }
    }
});

// パスワードの文字数をチェックするバリデーション
app.directive('emailLength',function(){
    return{
        restrict: "A",
        require: "ngModel",
        link: function(scope,element,attrs,ngModel){
            ngModel.$validators.emailLength = function(modelValue){
                if (modelValue) {
                    return modelValue.length <= 256;
                }
            };

            scope.$watch("modelValue", function() {
                ngModel.$validate();
            });
        }
    }
});

// パスワードの文字種をチェックするバリデーション
app.directive('passType',function(){
    return{
        restrict: "A",
        require: "ngModel",
        link: function(scope,element,attrs,ngModel){
            ngModel.$validators.passType = function(modelValue){
                if (modelValue) {
                    return /^[0-9a-zA-Z]+$/.test(modelValue);
                }
            };

            scope.$watch("modelValue", function() {
                ngModel.$validate();
            });
        }
    }
});

// パスワードの文字数をチェックするバリデーション
app.directive('passLength',function(){
    return{
        restrict: "A",
        require: "ngModel",
        link: function(scope,element,attrs,ngModel){
            ngModel.$validators.passLength = function(modelValue){
                if (modelValue) {
                    return modelValue.length >= 6 && modelValue.length <= 16;
                }
            };

            scope.$watch("modelValue", function() {
                ngModel.$validate();
            });
        }
    }
});

// htmlタグに'hide-tabbar'をつけるとタップした時にタブバーを非表示にする。
app.directive('hideTabbar', function($timeout) {
    return {
        link : function(scope, element, attrs) {
            element.bind('focus', function(e) {
                $timeout(function(){
                    scope.$apply(tabbar.setTabbarVisibility(false));
                });
            });
            element.bind('blur', function(e) {
                $timeout(function(){
                    scope.$apply(tabbar.setTabbarVisibility(true));
                });
            });
        }
    }
});

// ons-page読み込みディレクティブ
app.directive('myInclude', function($http, $compile) {
  return function(scope, element, attr) {
    $http.get(attr.myInclude).success(function(response) {
      element.html(response);
      $compile(element.contents())(scope);
    })
  };
});

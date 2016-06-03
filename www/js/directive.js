'use strict';
// 入力値2つを比較するバリデーション
app.directive("match", ["$parse", function($parse) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
    scope.$watch(function() {
      var target = $parse(attrs.match)(scope);  // 比較対象となるモデルの値
      return !ctrl.$viewValue || target === ctrl.$viewValue;
    }, function(currentValue) {
      ctrl.$setValidity('match', currentValue);
    });
    }
  }
}]);

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
                  return expression(modelValue, /^(?=.*[0-9])(?=.*[A-Za-z])[\w]{6,}$/);
                }
            };

            scope.$watch("modelValue", function() {
                ngModel.$validate();
            });
        }
    }
});

// メールアドレスの文字種をチェックするバリデーション
app.directive('email',function(){
    return{
        restrict: "A",
        require: "ngModel",
        link: function(scope,element,attrs,ngModel){
            ngModel.$validators.email = function(modelValue){
                if (modelValue) {
                  return expression(modelValue, /^(\w)+[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
                }
            };

            scope.$watch("modelValue", function() {
                ngModel.$validate();
            });
        }
    }
});

// 名前の文字数をチェックするバリデーション
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

app.directive('modalInclude', function() {
	return {
		restrict : 'E',
		scope : {
			var : '@'
		},
		templateUrl : 'template/modal.html'
	};
});


app.filter('abbreviate', function () {
  return function (text, len, end) {
    if (len === undefined) {
      // デフォルトは10文字
      len = 21;
    }
    if (end === undefined) {
      end = "…";
    }
    if(text !== undefined) {
      if(text.length > len) {
        return text.substring(0, len - 1) + end;
      }
      else {
        return text;
      }
    }
  };
});

// 正規表現による文字列チェックを行う。
function expression(value, regex) {
  return regex.test(value);
}

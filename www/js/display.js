'use strict';
app.controller('listCtrl', function($scope, mBaasService) {
	$scope.init = function() {
		var ncmb = mBaasService.getNcmb();
		var Posts = ncmb.DataStore("Posts");
		Posts.order("updateDate", true).fetchAll().then(function(results) {
			$scope.$apply($scope.posts = results);
		});
	}
});

app.controller('detailCtrl', function($scope) {
	$scope.init = function() {
		$scope.tab = 'map';
	}
	
	// 地図タブ表示
	$scope.toMap = function() {
		$scope.tab = 'map';
	}
	
	// コメントタブ表示
	$scope.toComment = function() {
		$scope.tab = 'comment';
	}
	
	$scope.toStaff = function() {
		$scope.tab = 'staff';
	}
});


app.constant('correspond', {
	'0':{class : 'still', label : 'これから対応します'},
	'1':{class : 'now', label : '対応中です'},
	'2':{class : 'fin', label : '対応しました'}
});

app.directive("toCorrespond", function(correspond) {
	return {
		restrict: 'A',
		scope:true,
		template:'<span class="correspond {{cor.class}}" ng-bind="cor.label"></span>',
		link: function (scope, element, attr) {
			var flag = attr['toCorrespond'];
			scope.cor = correspond[flag];
		}
	};
});

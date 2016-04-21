'use strict';
app.controller('listCtrl', function($scope, mBaasService) {
	$scope.init = function() {
		var ncmb = mBaasService.getNcmb();
		var Posts = ncmb.DataStore("Posts");
		Posts.fetchAll().then(function(results) {
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
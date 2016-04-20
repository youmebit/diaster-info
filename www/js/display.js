'use strict';
app.controller('displayCtrl', function($scope) {
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
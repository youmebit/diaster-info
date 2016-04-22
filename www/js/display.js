'use strict';
app.controller('selectCtrl', function($scope) {
	$scope.toAllInfo = function() {
		myNavigator.pushPage('display/list.html');
	}
});


app.constant('correspond', {
	'0':{class : 'still', label : 'これから対応します'},
	'1':{class : 'now', label : '対応中です'},
	'2':{class : 'fin', label : '対応しました'}
});

// 絞り込み機能
app.filter('listMatch', function(){
	return function(posts, selected){
		if (selected == -1) {
			return posts;
		}
		var filters = [];
		angular.forEach(posts, function(p) {
			if (p.correspond == selected) {
				filters.push(p);
			}
		});
		return filters;
	}
});

app.controller('listCtrl', function($scope, correspond, mBaasService) {
	$scope.init = function() {
		$scope.isFinImg = false;
		$scope.showFilter = true;
		$scope.toggle = correspond;
		$scope.cor = {selected : '-1'};
		var ncmb = mBaasService.getNcmb();
		var Posts = ncmb.DataStore("Posts");
		Posts.order("updateDate", true).fetchAll().then(function(results) {
			$scope.$apply($scope.posts = results);
		});

		$scope.$on('eventFinishedEventFired', function() {
			$scope.isFinImg = true;
		});
		
		$scope.$watch('cor.selected', function(value) {
			$scope.showFilter = true;
		});
	}

	// 詳細ページへ遷移する
	$scope.toDetail = function(objectId) {
		myNavigator.pushPage('display/detail.html', {id : objectId});
	}
});

app.controller('detailCtrl', function($scope, $timeout, mBaasService) {
//	詳細画面表示
	$scope.init = function() {
		var options = $scope.myNavigator.getCurrentPage().options;
		var ncmb = mBaasService.getNcmb();
		var Posts = ncmb.DataStore("Posts");
		Posts.equalTo("objectId", options.id).fetch().then(function(result) {
			$scope.$apply(function() {
				$scope.obj = result;
				$scope.$broadcast('viewMap', result);
				$scope.toMap();
			});
		});
		
		// データが取れたタイミングで地図を表示。
		$scope.$on('viewMap', function(event, result) {
			$timeout(function() {
				var geocoder = new google.maps.Geocoder();
				var centerLatlng = new google.maps.LatLng(result.point.latitude ,result.point.longitude);
				var myOptions = {
					zoom: 16,
					center: centerLatlng,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					disableDefaultUI: true
				};
				$scope.map = new google.maps.Map(document.getElementById("gmap"), myOptions);
				$scope.element = document.getElementById('gmap');
				var latlng = new google.maps.LatLng(result.point.latitude ,result.point.longitude);

				// マーカーをmap内に表示
				var marker = new google.maps.Marker({
					position: latlng,
					map: $scope.map
				});
			}, 100);
		});
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

app.directive("toCorrespond", function(correspond) {
	return {
		restrict: 'A',
		scope:false,
		template:'<span class="correspond {{cor.class}}" ng-bind="cor.label"></span>',
		link: function (scope, element, attr) {
			var flag = attr.toCorrespond;
			scope.cor = correspond[flag];
		}
	};
});

app.directive("eventFinished", function($timeout){
    return function(scope, element, attrs){
      if (scope.$last){
 		$timeout(function(){
          scope.$emit("eventFinishedEventFired");
        });
	  }
    }
});

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

app.controller('listCtrl', function($scope, correspond, posts, dialogService) {
	$scope.init = function() {
		$scope.isFinImg = false;
		$scope.showFilter = true;
		$scope.toggle = correspond;
		$scope.cor = {selected : '-1'};
		var onSuccess = function(results) {
			$scope.$apply($scope.posts = results);
		}
		posts.findAll(onSuccess);

		$scope.$on('eventFinishedEventFired', function() {
			$scope.isFinImg = true;
		});
		
		$scope.$watch('cor.selected', function(value) {
			$scope.showFilter = true;
		});
	}
	
	// 対応状況更新後の処理
	$scope.$on('update:success', function(e, msg) {
		$scope.init();
		dialogService.complete("更新しました。");
	});

	// 詳細ページへ遷移する
	$scope.toDetail = function(objectId) {
		myNavigator.pushPage('display/detail.html', {id : objectId});
	}
});

app.controller('detailCtrl', function($scope, $rootScope, $timeout, posts, correspond, dialogService) {
//	詳細画面表示
	$scope.init = function() {
		var options = $scope.myNavigator.getCurrentPage().options;
		$scope.toggle = correspond;
		$scope.form = {};
		var onSuccess = function(result) {
			$scope.$apply(function() {
				$scope.obj = result;
				$scope.form.correspond = result.correspond;
				$scope.form.response = result.response;
				$scope.$broadcast('viewMap', result);
				$scope.toMap();
			});
		}
		posts.findById(options.id, onSuccess);
		
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

	// 対応状況更新処理
	$scope.update = function() {
		dialogService.confirm('更新してもよろしいですか?');
		$scope.$on('confirm:ok', function() {
			var update = function(result) {
				result.set("correspond", $scope.form.correspond).set("response", $scope.form.response).update().then(function() {
					myNavigator.popPage();
					$rootScope.$broadcast('update:success', '更新しました。');
				}).catch(function(err) {
					console.log(err);
				});
			}
			posts.findById($scope.obj.objectId, update);
		});
	}
});

// Postsデータストア
app.factory('posts', function($rootScope, mBaasService) {
	return {
		findById : function(id, success) {
			var Posts = getPosts();
			Posts.equalTo("objectId", id).fetch().then(function(result) {
				success(result);
			});
		},
		findAll : function(success) {
			var Posts = getPosts();
			Posts.order("updateDate", true).fetchAll().then(function(results) {
				success(results);
			});
		},
	};

	function getPosts() {
		var ncmb = mBaasService.getNcmb();
		return ncmb.DataStore("Posts");
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

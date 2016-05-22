'use strict';
app.controller('selectCtrl', function($scope, Current, posts, RequestService, dialogService) {
	var fail = function() {
		dialogService.line_off();
	};

	$scope.toMyReport = function () {
		var success = function() {
			var id = Current.getCurrent().objectId;
			var dataStore = posts.getPosts().equalTo('userID', id);
			myNavigator.pushPage('display/list.html', {dataStore:dataStore});
		};
		RequestService.request(success, fail);
	}

	$scope.toAllInfo = function() {
		var success = function() {
		var dataStore = posts.getPosts();
		myNavigator.pushPage('display/list.html', {dataStore:dataStore});
		}
		RequestService.request(success, fail);
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

app.controller('listCtrl', function($scope, correspond, posts, dialogService, RequestService) {
	$scope.init = function() {
		$scope.showFilter = true;
		$scope.toggle = correspond;
		$scope.list_error = null;
		$scope.cor = {selected : '-1'};
		var success = function() {
			var options = $scope.myNavigator.getCurrentPage().options;
			if (!options.dataStore) {
				options.dataStore = posts.getPosts();
			}
			get_data(options.dataStore);
			$scope.$watch('cor.selected', function(value) {
				$scope.showFilter = true;
			});
		};
		var fail = function() {
			$scope.list_error = '電波が届かないため表示できません';
			$scope.items = [];
			$scope.isLoad = true;
		};
		RequestService.request(success, fail);
	}

	$scope.isShowList = function() {
		return $scope.isLoad && $scope.list_error == null;
	}

	var get_data = function(dataStore){
	// Factoryからデータ取得のメソッドを呼び出し、Promiseオブジェクトを格納する
		$scope.isLoad = false;
		var promise = posts.findAsync(dataStore);
		promise.then(function(results){
			  //成功時
			$scope.posts = results;
			$scope.isLoad = true;
		});
	}

	// 対応状況更新後の処理
	$scope.$on('update:success', function(e, msg) {
		$scope.init();
		dialogService.complete(msg);
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
		var update = function() {
			modal.show();
			var ok = function(result) {
				result.set("correspond", $scope.form.correspond).set("response", $scope.toNull($scope.form.response)).update().then(function() {
					modal.hide();
					myNavigator.popPage();
					$rootScope.$broadcast('update:success', '更新しました。');
				}).catch(function(err) {
	                $scope.$on('process:fail', function(event, err) {
	                    console.error(err);
	                });
				});
			}
			posts.findById($scope.obj.objectId, ok);
		};
		dialogService.confirm('更新してもよろしいですか?', update);
	}

	$scope.toNull = function(value) {
		if (!angular.isDefined(value)) {
			return null;
		}
		return value;
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

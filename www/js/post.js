app.controller('imgSelectCtrl', function ($scope, geoService, dialogService) {
    $scope.showCamera = function () {
        var options = {
            sourceType: Camera.PictureSourceType.CAMERA,
            saveToPhotoAlbum: true,
            cameraDirection: Camera.Direction.BACK
        }

        getPicture(options);
    }

    $scope.showGallery = function () {
        var options = {
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        }

        getPicture(options);
    }

    // ギャラリーorカメラから画像を投稿フォームに表示する。
    function getPicture(options) {
    	options.quality = 60;
    	options.targetWidth = 640;
    	options.targetHeight = 480;
    	options.correctOrientation = true;
        options.destinationType = Camera.DestinationType.DATA_URL;
        options.encodingType = Camera.EncodingType.JPEG;
    	
        var onSuccess = function (imageURI) {
            // 読み込み中の画面表示
            modal.show();
            
            // 住所が取れた場合
            var success = function(point) {
                var longAddress = "";
                var isAppend = true;
                angular.forEach(point.address, function (a) {
                    if (a.long_name.indexOf('市') != -1) {
                        isAppend = false;
                    }
                    if (isAppend) {
                        longAddress = a.long_name + longAddress;
                    }
                });
                myNavigator.pushPage('post/post.html', {
                    image: "data:image/jpeg;base64," + imageURI,
                    address: longAddress,
                    latitude: point.lat,
                    longitude: point.long
                });
            };

		// 住所を取得する
            geoService.currentPosition(success, function(error) {console.log(error.message);});
          }
        var onFail = function (err) {
        	if (err === 'Unable to retrieve path to picture!')  {
	        	dialogService.error("この画像は投稿できません。他の画像を選択してください。");
        	}
        	modal.hide();
        };
        navigator.camera.getPicture(function (imageURI) {
            onSuccess(imageURI);
        }, onFail, options);
    }
});

app.controller('postCtrl', function ($scope, users, dialogService, fileStore, posts, $q, $timeout) {
    // 画像縮小処理
    $scope.init = function () {
        $scope.piece = {};
        $scope.isLoad = false;
        var image = new Image();
        image.onload = function (e) {
        	var q = $q.defer();
        	$timeout(function() {
	            $scope.$apply(function () {
	                EXIF.getData(image, function () {
	                    $scope.piece.imageURI = image.src;
	                    $scope.isLoad = true;
	                    return q.promise;
	                });
	            });
        	}, 1000);
        }
        var options = $scope.myNavigator.getCurrentPage().options;
        $scope.piece.address = options.address;
        $scope.piece.latitude = options.latitude;
        $scope.piece.longitude = options.longitude;
		$scope.piece.userId = null;
		if ($scope.user.isLogin) {
			var current = users.getCurrentUser();
			$scope.piece.userId = current.objectId;
			$scope.piece.name = current.userName;
		}
        modal.hide();
        image.src = options.image;

    }

    // ファイルアップロード→データストア登録の順で登録する。
    $scope.post = function (piece) {
        var post = function() {
            postModal.show();
    		var blob = b64ToBlob(piece.imageURI);
			var fileName = getFileName();

			// データストア登録成功
			var saveSuccess = function () {
                postModal.hide();
				myNavigator.pushPage('post/post_info.html');
			}

			// ファイルアップロード成功→データストアへの登録
			var uploadSuccess = function () {
  				posts.postInfo(piece, fileName, saveSuccess, onFail);
  			};

  			var onFail = function (err) {
                postModal.hide();
  				console.error(err);
  			}
            
            // ファイルアップロード
            fileStore.upload(fileName, blob, uploadSuccess, onFail);
        };
    	dialogService.confirm('投稿してもよろしいですか？', post);
    }
});

// ファイル名を取得する
function getFileName() {
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var mi = date.getMinutes();
    var s = date.getSeconds();
    return y + padZero(m) + padZero(d) + padZero(h) + padZero(mi) + padZero(s) + ".jpg";
}

// 数字を0埋めする。
function padZero(value) {
    return ('0' + value).slice(-2);
}

// base64形式の画像データをBlobオブジェクトに変換する。
function b64ToBlob(base64) {
    var bin = atob(base64.replace(/^.*,/, ''));
    var buffer = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i);
    }
    // Blobを作成
    try {
        var blob = new Blob([buffer.buffer], {
            type: 'image/jpg'
        });
    } catch (e) {
        return false;
    }
    return blob;
}

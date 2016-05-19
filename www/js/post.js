app.controller('imgSelectCtrl', function ($scope, mBaasService, geoService, $timeout) {
    $scope.showCamera = function () {
        var options = {
            quality: 70,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            saveToPhotoAlbum: true,
            correntOrientation: true,
            encodingType: Camera.EncodingType.JPEG,
            cameraDirection: Camera.Direction.BACK
        }

        getPicture(options);
    }

    $scope.showGallery = function () {
        var options = {
            quality: 70,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG
        }

        getPicture(options);
    }

    // ギャラリーorカメラから画像を投稿フォームに表示する。
    function getPicture(options) {
        var onSuccess = function (imageURI) {
            // 読み込み中の画面表示
            modal.show();
            // 住所を取得する
            geoService.currentPosition();
            // 住所が取れた場合
            $scope.$on("geocode:success", function(event, point) {
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
            });
          }
        var onFail = function () {}
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
	                var imgWidth = image.naturalWidth;
	                var imgHeight = image.naturalHeight;
	                var rate = 0;
	                if (imgWidth >= imgHeight) {
	                    rate = 540 / imgWidth;
	                } else {
	                    rate = 540 / imgHeight;
	                }
	
	                EXIF.getData(image, function () {
	                    var canvas = document.createElement('canvas');
	                    var drawWidth = imgWidth * rate;
	                    var drawHeight = imgHeight * rate;
	                    canvas.width = drawWidth;
	                    canvas.height = drawHeight;
	                    var ctx = canvas.getContext('2d');
	                    var orientation = EXIF.getTag(image, "Orientation");
	                    if (orientation) {
	                        var angles = {
	                            '3': 180,
	                            '6': 90,
	                            '8': 270
	                        };
	                        ctx.translate(drawWidth / 2, drawHeight / 2);
	                        ctx.rotate((angles[orientation] * Math.PI) / 180);
	                        ctx.translate(-drawWidth / 2, -drawHeight / 2);
	                    }
	                    ctx.drawImage(image, 0, 0, imgWidth, imgHeight, 0, 0, drawWidth, drawHeight);
	                    $scope.piece.imageURI = canvas.toDataURL();
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
            modal.show();
    		var blob = b64ToBlob(piece.imageURI);
			var fileName = getFileName();

			// データストア登録成功
			var saveSuccess = function () {
                modal.hide();
				myNavigator.pushPage('post/post_info.html');
			}

			// ファイルアップロード成功→データストアへの登録
			var uploadSuccess = function () {
  				posts.postInfo(piece, fileName, saveSuccess, onFail);
  			};

  			var onFail = function (err) {
                modal.hide();
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

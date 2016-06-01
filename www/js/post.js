// カメラで撮影した画像を加工するクラス
var CameraImgFormatter = function() {};
CameraImgFormatter.prototype = {
	getImageData : function(image) {
		return image.src;
	},
	getUrl : function(imageURI) {
		return "data:image/jpeg;base64," + imageURI;
	}
};

// ギャラリーから取得した画像を加工するクラス
var GalleryImgFormatter = function() {};
GalleryImgFormatter.prototype = new CameraImgFormatter();
GalleryImgFormatter.prototype.getImageData = function(image) {
	var canvas = document.createElement('canvas');
    var width = image.naturalWidth;
    var height = image.naturalHeight;
	var orientation = image.exifdata.Orientation;
	var src = image.src.split("?")[0];
	var ctx = canvas.getContext('2d');

    var rate = 0;
    var size = 640;
    if (width >= height) {
        rate = size / width;
    } else {
        rate = size / height;
    }

    var drawWidth = width * rate;
    var drawHeight = height * rate;

	canvas.width = drawWidth;
    canvas.height = drawHeight;
	console.log(drawWidth + ":" + drawHeight);
    if (orientation) {

		var angles = {
            '3': 180,
            '6': 90,
            '8': 270
        };
        // ctx.translate(drawWidth / 2, drawHeight / 2);
        // ctx.rotate((angles[orientation] * Math.PI) / 180);
        // ctx.translate(-drawWidth / 2, -drawHeight / 2);
    }
    ctx.drawImage(image, 0, 0, drawWidth, drawHeight);
	return canvas.toDataURL();
};

GalleryImgFormatter.prototype.getUrl = function(imageURI) {
	return imageURI;
};

app.controller('imgSelectCtrl', function ($scope, geoService, dialogService) {
    $scope.showCamera = function () {
        var options = {
            sourceType: Camera.PictureSourceType.CAMERA,
            saveToPhotoAlbum: true,
        	destinationType: Camera.DestinationType.DATA_URL,
            cameraDirection: Camera.Direction.BACK,
            targetWidth:640,
    		targetHeight:480
        }
        getPicture(options, new CameraImgFormatter());
    }

    $scope.showGallery = function () {
        var options = {
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: Camera.DestinationType.FILE_URI,
            targetWidth:640
        }

        getPicture(options, new GalleryImgFormatter());
    }

    // ギャラリーorカメラから画像を投稿フォームに表示する。
    function getPicture(options, formatter) {
    	options.quality = 60;
    	options.correctOrientation = true;
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
                    image: formatter.getUrl(imageURI),
                    address: longAddress,
                    latitude: point.lat,
                    longitude: point.long, 
                    formatter : formatter
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
    // 初期表示
    $scope.init = function () {
        $scope.piece = {};
        $scope.isLoad = false;
        var options = $scope.myNavigator.getCurrentPage().options;
        var image = new Image();
        image.onload = function (e) {
        	var q = $q.defer();
        	$timeout(function() {
        		EXIF.getData(image, function () {
		            $scope.$apply(function () {
	                    $scope.piece.imageURI = options.formatter.getImageData(image);
	                    $scope.isLoad = true;
	                    return q.promise;
		            });
				});

        		
        	}, 1000);
        }
        $scope.piece = options;
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

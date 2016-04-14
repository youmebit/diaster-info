app.controller('imgSelectCtrl', function ($scope, mBaasService) {
    $scope.showCamera = function () {
        var options = {
            quality: 70,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            saveToPhotoAlbum: true,
            correntOrientation: false,
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
            //            var blob = toBlob(imageURI);
            //            var ncmb = mBaasService.getNcmb();
            //            ncmb.File.upload(Date.now() + '.jpg', blob).then(
            //                function (data) {
            //                    console.log('できたー');
            //                    myNavigator.pushPage('post.html', {
            //                        image: data.uri
            //                    });
            //                }
            //            ).catch(function (err) {
            //                console.error(err);
            //            });
            myNavigator.pushPage('post.html', {
                image: "data:image/jpeg;base64," + imageURI
            });
        }

        var onFail = function () {
        }

        navigator.camera.getPicture(function (imageURI) {
            onSuccess(imageURI);
        }, onFail, options);
    }

});

app.controller('postCtrl', function ($scope, mBaasService) {
    // 画像縮小処理
    $scope.init = function () {
        $scope.piece = {};
        var image = new Image();
        image.onload = function (e) {
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
                    var angles = {
                        '3': 180,
                        '6': 90,
                        '8': 270
                    };
                    ctx.translate(drawWidth / 2, drawHeight / 2);
                    ctx.rotate((angles[orientation] * Math.PI) / 180);
                    ctx.translate(-drawWidth / 2, -drawHeight / 2);
                    ctx.drawImage(image, 0, 0, imgWidth, imgHeight, 0, 0, drawWidth, drawHeight);
                    $scope.piece.imageURI = canvas.toDataURL();
                });
            })
        }
        var options = $scope.myNavigator.getCurrentPage().options;
        image.src = options.image;
        
        $scope.piece.address = '小林1丁目6-20';
    }

//    ファイルアップロード→データストア登録の順で登録する。
    $scope.post = function (piece) {
        if(!window.confirm('投稿してもよろしいですか？')) {
            return false;
        }
        var blob = b64ToBlob(piece.imageURI);
        var ncmb = mBaasService.getNcmb();
        var fileName = getFileName();
        
        // データストア登録成功
        var saveSuccess = function() {
            myNavigator.pushPage('post_info.html');
        }

        // ファイルアップロード成功
        var uploadSuccess = function() {
            var Posts = ncmb.DataStore("Posts");
            var data = new Posts();
            data.set("username", piece.name);
            data.set("photo", fileName);
            data.set("address", piece.address);
            data.set("comment", piece.comment);
            data.save().then(function(data) {
                saveSuccess();
            }).catch(function(err) {
                onFail(err);
            });
        }
                     
        var onFail = function(err) {
            console.error(err);
            alert('申し訳ありませんが、電波の届くところでもう一度投稿してください。');
        }
            
        ncmb.File.upload(fileName, blob).then(
            function (data) {
                uploadSuccess();
            }
        ).catch(function (err) {
            onFail(err);
        });
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
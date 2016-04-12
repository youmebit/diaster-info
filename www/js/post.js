app.controller('imgSelectCtrl', function ($scope) {
    $scope.showCamera = function () {
        var options = {
            quality: 70,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            saveToPhotoAlbum: true,
            correntOrientation: true,
            encodingType: Camera.EncodingType.JPEG,
            cameraDirection: Camera.Direction.BACK
        }

        var onSuccess = function (imageURI) {
            console.log(imageURI);
            myNavigator.pushPage('post.html', {
                image: imageURI
            });
        }

        getPicture(options, onSuccess);

        //        navigator.camera.getPicture(function (imageURI) {
        //            onSuccess(imageURI);
        //        }, onFail, options);
    }

    $scope.showGallery = function () {
        var options = {
            quality: 70,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG
        }

        var onSuccess = function (imageURI) {
            myNavigator.pushPage('post.html', {
                image: "data:image/jpeg;base64," + imageURI
            });
        }

        getPicture(options, onSuccess);
    }

    // ギャラリーorカメラから画像を投稿フォームに表示する。
    function getPicture(options, onSuccess) {

        var onFail = function () {
            console.error('画像の取得失敗');
        }

        navigator.camera.getPicture(function (imageURI) {
            onSuccess(imageURI);
        }, onFail, options);
    }
});

app.controller('postCtrl', function ($scope) {
    var options = $scope.myNavigator.getCurrentPage().options;
    $scope.imageURI = options.image;
});
app.controller('imgSelectCtrl', function ($scope, mBaasService) {
    $scope.$watch('file', function(file) {
        if (!file) {
            return;
        }
        upload();
    });
    
        var upload = function() {
            mBaasService.getNcmb();
        var ncmbFile = new NCMB.File(Date.now() + $scope.file.name, $scope.file);
        ncmbFile.save().then(function() {
            // アップロード成功
            alert('アップロードしました！');
        }, function(error) {
            // アップロード失敗
            alert(error);
        });
    }
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

        var onSuccess = function (imageURI) {
            console.log(imageURI);
            myNavigator.pushPage('post.html', {
                image: imageURI
            });
        }

        getPicture(options, onSuccess);
    }

    $scope.showGallery = function () {
        var options = {
            quality: 70,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG
        }

        var onSuccess = function (imageURI) {

            var blob = toBlob(imageURI);
            var ncmb = mBaasService.getNcmb();
            ncmb.File.upload('aa.jpg', blob).then(
                function (data) {
                    console.log('できたー');
                    myNavigator.pushPage('post.html', {
                        image: data.uri
                    });
                }
            ).catch(function (err) {
                console.error(err);
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

    function toBlob(base64) {
        base64 = "data:image/jpeg;base64," + base64;
        var bin = atob(base64.replace(/^.*,/, ''));
        var buffer = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
            buffer[i] = bin.charCodeAt(i);
        }
        // Blobを作成
        try {
            var blob = new Blob([buffer], {
                type: 'image/jpg'
            });
        } catch (e) {
            window.BlobBuilder = window.BlobBuilder || 
                                     window.WebKitBlobBuilder || 
                                     window.MozBlobBuilder || 
                                     window.MSBlobBuilder;
            if(e.name == 'TypeError' && window.BlobBuilder){
                var bb = new (window.BlobBuilder)();
                console.log(buffer[0]);
                bb.append([buffer]);
                blob = bb.getBlob("image/jpg");
            } else {
                console.error(err);
                return false;
            }
        }
        return blob;
    }
});

app.controller('postCtrl', function ($scope) {
    var options = $scope.myNavigator.getCurrentPage().options;
    $scope.imageURI = options.image;
});

app.directive('fileModel',function($parse){
    return{
        restrict: 'A',
        link: function(scope,element,attrs){
            var model = $parse(attrs.fileModel);
            element.bind('change',function(){
                scope.$apply(function(){
                    model.assign(scope,element[0].files[0]);
                    
                });
            });
        }
    };
});
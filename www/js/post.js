app.controller('imgSelectCtrl', function($scope) {
    $scope.showCamera = function() {
        var options = {
            quality : 75,
           destinationType : Camera.DestinationType.FILE_URI,
           sourceType : Camera.PictureSourceType.CAMERA,
            saveToPhotoAlbum : true,
            correntOrientation : true,
            cameraDirection : Camera.Direction.BACK
        }
        
        var onSuccess = function(imageURI) {
            myNavigator.pushPage('post.html', {image: imageURI});
        }
        
        var onFail = function() {
            console.log('写真失敗');
        }
        navigator.camera.getPicture(function(imageURI) {
            onSuccess(imageURI);
        }, onFail, options);
    }
    
    $scope.showGallery = function() {
//        $scope.images = ['http://lorempixel.com/100/100/animals', 'http://lorempixel.com/100/100/cats', 'http://lorempixel.com/100/100/fashion', 'http://lorempixel.com/100/100/people', 'http://lorempixel.com/100/100/city', 'http://lorempixel.com/100/100/nightlife', 'http://lorempixel.com/100/100/food','http://lorempixel.com/100/100/sports'];
    }
});

app.controller('postCtrl', function($scope) {
    var options = $scope.myNavigator.getCurrentPage().options;
    $scope.imageURI = options.image;
});
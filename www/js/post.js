app.controller('postCtrl', function($scope) {
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
            console.log(imageURI);
            myNavigator.pushPage('post/post.html');
        }
        
        var onFail = function() {
            console.log('写真失敗');
        }
        navigator.camera.getPicture(function(imageURI) {
            onSuccess(imageURI);
        }, onFail, options);
    }
    
    $scope.showGallery = function() {
        $scope.images = ['http://lorempixel.com/100/100/animals', 'http://lorempixel.com/100/100/cats', 'http://lorempixel.com/100/100/fashion', 'http://lorempixel.com/100/100/people', 'http://lorempixel.com/100/100/city', 'http://lorempixel.com/100/100/nightlife', 'http://lorempixel.com/100/100/food','http://lorempixel.com/100/100/sports'];
    }
});
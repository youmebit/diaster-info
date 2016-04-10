app.controller('postCtrl', function($scope) {
    $scope.showCamera = function() {
        $scope.isCamera = true;
    }
    
    $scope.showGallery = function() {
        $scope.isCamera = false;
        $scope.images = ['http://lorempixel.com/100/100/animals', 'http://lorempixel.com/100/100/cats', 'http://lorempixel.com/100/100/fashion', 'http://lorempixel.com/100/100/people', 'http://lorempixel.com/100/100/city', 'http://lorempixel.com/100/100/nightlife', 'http://lorempixel.com/100/100/food','http://lorempixel.com/100/100/sports'];
    }
});
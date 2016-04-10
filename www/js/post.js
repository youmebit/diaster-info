app.controller('postCtrl', function($scope) {
    $scope.showCamera = function() {
        $scope.isCamera = true;
    }
    
    $scope.showGallery = function() {
        $scope.isCamera = false;
    }
});
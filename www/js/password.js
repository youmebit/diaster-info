'use strict';
app.controller('mailCtrl', function($scope, users) {
  $scope.sendMail = function(reset) {
    myNavigator.pushPage('reset/mail_info.html');
  };
});

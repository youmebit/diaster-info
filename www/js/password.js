'use strict';
app.controller('mailCtrl', function($scope, users, dialogService) {
  $scope.mailAddress;
  $scope.sendMail = function(reset) {
      var reset = function() {
          users.reset($scope.mailAddress);
          myNavigator.pushPage('reset/mail_info.html');
      };
      dialogService.confirm("パスワードをリセットしてもよろしいですか？", reset);
  }
});

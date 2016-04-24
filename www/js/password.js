'use strict';
app.controller('mailCtrl', function($scope, users, dialogService) {
  $scope.sendMail = function(reset) {
      dialogService.confirm("パスワードをリセットしてもよろしいですか？");
      $scope.$on('confirm:ok', function() {
          users.reset(reset.email);
          $scope.$on("reset:success", myNavigator.pushPage('reset/mail_info.html'));
      });
  }
});

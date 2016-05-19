'use strict';
var userFactory = {};
// usersのモッククラス
userFactory.current = {};
userFactory.getCurrentUser = function() {
    return this.current;
};

userFactory.setCurrent = function(_current_) {
  this.current = _current_;
};

userFactory.loginAsEmail = function(address, password) {
    this.current.sessionToken = "Yn8QPGmR";
}

userFactory.loginAsAnonymous = function(id, undefined) {
  if (this.current == null) {
    this.current = {
      userName : "VGeMXn8LavUx",
      updateDate : new Date()
    };
  }
  this.current.sessionToken = "Pt76QvJX";
}

// Currentのモッククラス
var mockCurrent = {};
mockCurrent.user = {};
mockCurrent.setCurrent = function(_user_) {
  this.user = _user_;
}

mockCurrent.getCurrent = function() {
  return this.user;
}

mockCurrent.initialize = function() {
  return this.user;
}
mockCurrent.setUpdateDate = function(date) {
  this.user.updateDate = date;
}
mockCurrent.getUpdateDate = function() {
  return this.user.updateDate;
}

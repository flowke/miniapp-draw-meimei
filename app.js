//app.js
require('./lib/regenerator-runtime')
const authUserInfo = require('./api/authUserInfo');
const api = require('./helper/api');


App({
  globalData: {
    userInfo: null
  },

  onShow(){


  },

  updateGlobalUserInfo(userInfo){
    this.globalData.userInfo = userInfo;
  }

})

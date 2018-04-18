//app.js
require('./lib/regenerator-runtime')
const auth = require('./api/auth');
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

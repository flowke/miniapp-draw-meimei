//app.js
// require('./lib/regenerator-runtime')
const auth = require('./api/auth');
const api = require('./helper/api');
const req = require('./api/req');

App({
  globalData: {
    userInfo: null
  },

  onLaunch(){


  },



  updateGlobalUserInfo(userInfo){
    this.globalData.userInfo = userInfo;
  }

})

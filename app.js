//app.js
require('./lib/regenerator-runtime')
const auth = require('./api/auth');
const api = require('./helper/api');


App({
  globalData: {
    userInfo: null
  },

  onLaunch(){
    api.login()
    .then(ret=>{
      return api.request({
        url: 'http://localhost:3000/user/login',
        data: {code: ret.code},
        method: 'POST'
      });
    })
    .then(res=>{
      console.log(res);
    })
  },

  updateGlobalUserInfo(userInfo){
    this.globalData.userInfo = userInfo;
  }

})

//app.js
require('./lib/regenerator-runtime')
const authUserInfo = require('./api/authUserInfo');
const api = require('./helper/api');


App({
  globalData: {
    userInfo: null
  },

  onShow(){

    // 授权用户细信息
    authUserInfo()
      .then(()=>{
        // 用户授权了
        // 开始获取用户信息
        api.getUserInfo()
          .then(({userInfo})=>{

            this.updateGlobalUserInfo(userInfo);

          })
          .catch(()=>{
            // 没有获取到用户信息
          })
      })
      .catch(()=>{
        // 用户未授权
      })

  },

  updateGlobalUserInfo(userInfo){
    this.globalData.userInfo = userInfo;
  }

})

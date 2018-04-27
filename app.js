//app.js
// require('./lib/regenerator-runtime')
const auth = require('./api/auth');
const api = require('./helper/api');

App({
  globalData: {
    userInfo: null
  },

  onLaunch(){

    let id = wx.getStorageSync('userID');

    if(!id){
      api.showLoading({
        title: '登录中',
        mask: true
      })
      .then(()=>{
        api.login()
        .then(ret=>{
          return api.request({
            url: 'http://localhost:3000/user/login',
            data: {code: ret.code},
            method: 'POST'
          });
        })
        .then(res=>{
          let {data} = res.data
          api.setStorage({
            key: 'userID',
            data: data._id
          });
          wx.hideLoading();
        });
      })

    }

  },

  updateGlobalUserInfo(userInfo){
    this.globalData.userInfo = userInfo;
  }

})

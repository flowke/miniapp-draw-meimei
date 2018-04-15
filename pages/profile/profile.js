const authUserInfo = require('../../api/authUserInfo');
const api = require('../../helper/api');

let p = 'https://pic.qqtn.com/up/2017-12/15138357828139708.jpg';

const app = getApp();

Page({

  data: {
    hasAuthUserInfo: true,
    userInfo: {},
    hasUserInfo: false
  },

  onShow(){

    console.log('show');
    if(app.globalData.userInfo){
      this.setData({
        hasAuthUserInfo: true,
        hasUserInfo: true,
        userInfo: app.globalData.userInfo
      })
    }else{
      authUserInfo()
        .then(ret=>{
          // 授权用户成功
          // 获取用户信息
          api.getUserInfo({withCredentials: true})
          .then(ret=>{
            console.log(ret);
            this.setData({
              userInfo: ret.userInfo,
              hasAuthUserInfo: true,
              hasUserInfo: true
            });
            app.updateGlobalUserInfo(ret.userInfo)
          })
          .catch(e=>{
            // 获取用户信息失败
            console.log(e);
          });

        })
        .catch(()=>{
          // 授权失败
          console.log('fali');
          this.setData({
            hasAuthUserInfo: false
          });
        });
    }


  },

  openSetting(){
    api.openSetting()
      .then(({authSetting})=>{
        if(authSetting['scope.userInfo']){
          this.setData({
            hasAuthUserInfo: true
          })
        }
      });

  },

  getLocation(ev){
    wx.login({
      success: ret=>{
        wx.request({
          url: 'http://localhost:3000/user/login',
          data: {code: ret.code},
          method: 'POST',
          success: (ret)=>{
            console.log(ret.data);
          }
        })
      }
    })
  }

})

//index.js
// const friends = require('./mockFriends.js');
const req = require('../../api/req');

//获取应用实例
const app = getApp();

Page({
  data: {
    friends: [],
    hasInitLoad: false
  },
  onLoad(){
    this._renderFriends(true);
  },
  onShow(){
    if(!this.data.hasInitLoad) return;
    this._renderFriends();
  },

  onShareAppMessage({from, target}){
    let userID = wx.getStorageSync('userID');
    if(!userID){
      req.login()
      .then(userID=>{
        return {
          title: '脚步与你',
          path: `/pages/checkProfile/check-profile?userID=${userID}`
        }
      })
    }else{
      return {
        title: '脚步与你',
        path: `/pages/checkProfile/check-profile?userID=${userID}`
      }
    }

  },

  // 跳转查看成员
  onCheckDetail({currentTarget}){
    let {id} = currentTarget;
    wx.navigateTo({url: `/pages/checkProfile/check-profile?userID=${id}`})
  },

  // 下拉刷新
  onPullDownRefresh(){

    this._renderFriends()
    .then(()=>{
      wx.stopPullDownRefresh();
    });
  },

  // 渲染朋友
  _renderFriends(showLoading=false){
    if(showLoading) wx.showLoading();
    wx.showNavigationBarLoading();
    return req.getFriends()
    .then(res=>{
      console.log(res);
      if(res.code===0){
        this.setData({
          friends: res.data,
          hasInitLoad: true
        });
      };
      wx.hideNavigationBarLoading();
      wx.hideLoading();
    })
  },

})

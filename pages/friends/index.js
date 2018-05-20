//index.js
// const friends = require('./mockFriends.js');
const req = require('../../api/req');

//获取应用实例
const app = getApp();

Page({
  data: {
    friends: []
  },
  onLoad(){
    this._renderFriends();
  },
  onCheckDetail({currentTarget}){
    let {id} = currentTarget;
    wx.navigateTo({url: `/pages/checkProfile/check-profile?userID=${id}`})
  },

  onPullDownRefresh(){
    this._renderFriends()
    .then(()=>{
      wx.stopPullDownRefresh();
    });
  },

  _renderFriends(){
    return req.getFriends()
    .then(res=>{
      if(res.code===0){
        this.setData({
          friends: res.data
        });
      }
    })
  }
})

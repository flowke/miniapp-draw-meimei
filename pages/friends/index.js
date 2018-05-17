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
    req.getFriends()
    .then(res=>{
      this.setData({
        friends: res.data.map(user=>{
          return {
            id:user._id,
            avatar: user.userInfo.avatarUrl,
            name: user.userInfo.nickName,
            time: user.updatedAt
          }
        })
      })
    })
  },
  onCheckDetail({currentTarget}){
    let {id} = currentTarget;
    wx.navigateTo({url: `/pages/profile/profile?userID=${id}`})
  }

})

const auth = require('../../api/auth');
const path = require('../../api/path');
const api = require('../../helper/api');
const req = require('../../api/req');
const mix = require('../common/profile_mix');

Page({

  data: {
    userID: '',
    userInfo: null,
    markers: [],
    hasCollect: false
  },

  onLoad(query){
    let {userID} = query;
    this.setData({
      userID
    });
    this._renderProfile(userID, false);
    req.checkCollect(userID)
    .then(res=>{
      this.setData({
        hasCollect: res.hasCollect
      })
    })

  },

  ...mix.methods,
  ...mix.events,

  onGotoHome(){
    wx.switchTab({
      url: path.url('/pages/profile/profile')
    })
  },

  onCollect(){
    let {userID, hasCollect} = this.data;

    req.checkLogin()
    .then(res=>{
      return res.code!==0 ? req.login() : userID
    })
    .then(id=>{
      return !hasCollect? req.collect(userID) : req.delCollect(userID);
    })
    .then(res=>{
      if(res.code===0){
        this.setData({
          hasCollect: !hasCollect
        })
      }
    })
  }
})

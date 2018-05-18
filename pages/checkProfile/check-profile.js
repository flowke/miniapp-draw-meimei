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
  },

  onLoad(query){
    let {userID} = query;
    this.setData({
      userID
    });
    this._renderProfile(userID, false);
  },

  ...mix.methods,
  ...mix.enents,

})

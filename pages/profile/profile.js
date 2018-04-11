Page({

  getLocation: ev=>{
    wx.login({
      success: ret=>{
        wx.request({
          url: 'http://localhost:3000/user/login',
          data: {code: ret.code},
          method: 'POST',
          success: (ret)=>{
            console.log(ret);
          }
        })
      }
    })
  }

})

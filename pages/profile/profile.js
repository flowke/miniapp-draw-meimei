Page({

  getLocation: ev=>{
    wx.login({
      success: ret=>{
        console.log(ret);
      }
    })
  }

})

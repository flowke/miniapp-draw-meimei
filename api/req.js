const api = require('../helper/api');

const baseURL = 'http://localhost:3000'

let get = (url, data)=>{

  return api.request({
    url: baseURL + url,
    data,
    header: {
      cookie: wx.getStorageSync('sess-cookie')
    }
  });
}
let post = (url, data)=>{
  return api.request({
    url: baseURL + url,
    method: 'POST',
    data,
    header: {
      cookie: wx.getStorageSync('sess-cookie')
    }
  });
}

// 请求保存 mark
exports.addMark = (data)=>post('/mark/add', data);

// 请求获取 mark
exports.getMarkers = (data)=>get('/mark/get', data);

// 登陆
exports.login = (msg='登陆中')=>{
  api.showLoading({
    title: msg,
    mask: true
  })
  .then(()=>api.login())
  .then(ret=>{
    return post('/user/login',{
      code: ret.code
    });
  })
  .then(res=>{
    let {data:{data}, header} = res
    wx.setStorageSync('userID', data._id);
    wx.setStorageSync('sess-cookie',header['Set-Cookie']);
    wx.hideLoading();
  });
}

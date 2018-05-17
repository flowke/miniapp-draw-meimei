const api = require('../helper/api');

const baseURL = 'http://192.168.11.10:3000'

let get = (url, data)=>{

  return api.request({
    url: baseURL + url,
    data,
  });
};
let post = (url, data)=>{
  return api.request({
    url: baseURL + url,
    method: 'POST',
    data,
  });
};

let getWithCookie = (url, data)=>{

  return api.request({
    url: baseURL + url,
    data,
    header: {
      cookie: wx.getStorageSync('sess-cookie')
    }
  });
};
let postWithCookie = (url, data)=>{

  return api.request({
    url: baseURL + url,
    data,
    method: 'POST',
    header: {
      cookie: wx.getStorageSync('sess-cookie')
    }
  })

};

exports.getFriends = ()=> getWithCookie('/user/getFriends').then(res=>res.data)

// 请求保存 mark
exports.addMark = (data)=>postWithCookie('/mark/add', data);

// {
//   ids: [id...]
// }
exports.deleteMark = (data)=>postWithCookie('/mark/delete', data).then(res=>res.data);

// 请求获取 mark
// {
//   userID
// }
exports.getMarkers = (userID)=>getWithCookie('/mark/get', {userID}).then(res=>res.data);

// 登陆
exports.login = (msg='登陆中')=>{
  return api.showLoading({
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
    let {data:{data}, header} = res;
    wx.setStorageSync('userID', data._id);
    wx.setStorageSync('sess-cookie', header['Set-Cookie']);
    wx.hideLoading();
    return data._id;
  });
}
// {
//   userInfo
// }
exports.saveUserInfo = (userInfo)=>{
  return postWithCookie('/user/save-userinfo', {
    userInfo
  }).then(res=>res.data)
}
// 获取他人的 profile 信息
// {
//   userID
// }
exports.getProfile = (userID)=>{
  return api.request({
    url: baseURL + '/user/get-profile',
    data: {
      userID
    }
  }).then(res=>res.data);
}

// 修改 marker 地址
// {
//    markerID,
//    title,
//    address,
//    latitude,
//    longitude,
// }
exports.editMarkerAddress = data =>{
  return postWithCookie('/mark/edit-address',data)
    .then(res=>res.data)
}
// 编辑修改某个事件
// markerID
// eventID
// incidentTime
// incidentDesc
exports.editEvent = data=>{
  return postWithCookie('/mark/edit-event',data)
    .then(res=>res.data)
}
// 添加一个事件
// markerID
// incidentTime
// incidentDesc
exports.addEvent = data=>{
  return postWithCookie('/mark/add-event',data)
    .then(res=>res.data)
}
// {
//   markerID
//   eventID
// }
exports.deleteEvent = data=>{
  return postWithCookie('/mark/delete-event',data)
    .then(res=>res.data)
}

exports.checkLogin = ()=>{
  return postWithCookie('/user/checkLogin')
    .then(res=>res.data)
}

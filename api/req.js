const api = require('../helper/api');

const baseURL = 'http://192.168.0.9:3000'

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

  function request() {
    return api.request({
      url: baseURL + url,
      data,
      header: {
        cookie: wx.getStorageSync('sess-cookie')
      }
    });
  }

  return request(url, data)
  .then(res=>{
    if(res.data.code===444){
      return exports.login()
      .then(res=>request(url, data))
    }else{
      return res
    }
  })

};
let postWithCookie = (url, data)=>{

  function request(url, data) {
    return api.request({
      url: baseURL + url,
      data,
      method: 'POST',
      header: {
        cookie: wx.getStorageSync('sess-cookie')
      }
    });
  }

  return request(url, data)
  .then(res=>{
    if(res.data.code===444){
      return exports.login()
      .then(res=>request(url, data))
    }else{
      return res
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
// {
//   code: 0,
//   id: userID
// }
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
    let {data, header} = res;
    console.log(data,'用户');
    wx.setStorageSync('userID', data.id);
    wx.setStorageSync('sess-cookie', header['Set-Cookie']);
    wx.hideLoading();
    return data.id;
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

//
// {code:0}
// code: 1 , 登录失效
// code: 444, 登录失效
exports.checkLogin = ()=>{
  return postWithCookie('/user/checkLogin')
    .then(res=>res.data)
}

exports.collect=(personID)=>{
  return postWithCookie('/user/collect',{
    personID
  })
    .then(res=>res.data)
}
exports.delCollect=(personID)=>{
  return postWithCookie('/user/delCollect',{
    personID
  })
    .then(res=>res.data)
}

// {
//   code: 0,
//   hasCollect: true
// }
// {
//   code: 1,
//   hasCollect: false
// }
//
exports.checkCollect=(personID)=>{
  return postWithCookie('/user/checkCollect',{
    personID
  })
  .then(res=>res.data)
}

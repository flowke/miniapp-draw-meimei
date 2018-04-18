
let bindAPI = (apiName, bindObj=wx)=>(o={})=>new Promise((resolve, reject)=>{

  bindObj[apiName](Object.assign({}, o, {
    o,
    success: resolve,
    fail: reject
  }))
});

// 接口的命名空间
let apiSpace = {
  // 网络
  net: [
    'request',

    'uploadFile',
    'downloadFile',

    'connectSocket',
    'onSocketOpen',
    'onSocketError',
    'sendSocketMessage',
    'onSocketMessage',
    'closeSocket',
    'onSocketClose'
  ],

  // 数据缓存
  dataCache:[
    'setStorage',
    'setStorageSync',
    'getStorage',
    'getStorageSync',
    'getStorageInfo',
    'getStorageInfoSync',
    'removeStorage',
    'removeStorageSync',
    'clearStorage',
    'clearStorageSync',
  ],

  // location
  location:[
    'getLocation',
    'chooseLocation',
    'openLocation',
  ],

  // 设备

  device: [

    // 网络状态
    'getNetworkType',
  ],

  // 界面
  userface: [
    // 交互反馈
    'showToast',
    'showLoading',
    'hideToast',
    'hideLoading',
    'showModal',
    'showActionSheet',

    // 设置导航条

    // 导航
    'navigateTo',
    'redirectTo',
    'reLaunch',
    'switchTab',
    'navigateBack',

  ],


  // 开发接口
  openAPI: [
    'login',
    'checkSession',
    // 授权
    'authorize',
    'getUserInfo',

    // 支付
    'requestPayment',

    // 设置
    'getSetting',
    'openSetting'
  ]
}

let rawNameArr = [];

for(let k in apiSpace){
  rawNameArr = [...rawNameArr, ...apiSpace[k]]
}

module.exports = rawNameArr.reduce( (accu,elt)=>{

  if(Object.prototype.toString.call(elt)==='[object String]'){
    accu[elt] = bindAPI(elt)
  }else{
    accu[elt.name] = bindAPI(elt.name, elt.thisArg)
  }

  return accu;
}, {});

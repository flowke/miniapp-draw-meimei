const auth = require('../../api/auth');
const api = require('../../helper/api');
const req = require('../../api/req');
const mix = require('../common/profile_mix');
const path = require('../../api/path');

let p = 'https://pic.qqtn.com/up/2017-12/15138357828139708.jpg';

const app = getApp();

// query
//   userID 有说明是查看

Page({
  selMarkers: [],
  data: {
    userID: '',
    hasReqAuth: false,
    userInfo: null,
    markers: [],
    // 是否切换为选择删除模式模式
    isMultiSel: false,
    // 当前选中的
    curtSel: {},
    // 是否为全部选择
    isSelAll: false,
  },

  ...mix.methods,
  ...mix.events,

  onLoad(){
    // 初始化 marker 信息
    // 渲染 markers
    req.checkLogin()
    .then(res=>{
      let userID = wx.getStorageSync('userID');
      let sessionID = wx.getStorageSync('sess-cookie');
      if(res.code===0 && userID && sessionID){
        return userID;
      }else{
        return req.login();
      }
    })
    .then(userID=>{
      this.setData({
        userID
      });
      return this._getMarkers(userID);
    })
    .then(mks=>{
      this._renderMksWithCache(mks);
    });

    // start  auth
    // 处理用户信息渲染
    auth.getAuth('userInfo')
    .then(hasAuth=>{
      let {userInfo} = app.globalData;
      if(hasAuth && userInfo){
        return userInfo;
      }else if(hasAuth && !userInfo){

        return api.getUserInfo({withCredentials: true})
        .then(ret=>ret.userInfo)
      }else{
        return null;
      }
    })
    .then(userInfo=>{

      if(!userInfo){
        this.setData({
          hasReqAuth: true,
        });
      }else{
        this.setData({
          userInfo
        });
        app.updateGlobalUserInfo(userInfo)
      }
    })
  },

  // 页面显示时候
  onShow(){
    let mks = wx.getStorageSync('markers');
    if(mks){
      this._renderMarkers(mks);
    }

  },

  // 获取用户信息
  // 如果是第一次, 会授权
  onGetUserinfo({detail}){
    if(!detail.userInfo) return;
    this.setData({
      userInfo: detail.userInfo
    });
    req.saveUserInfo(detail.userInfo)
    .then(res=>{
      console.log(res, 'saveUserInfo');
    })
  },

  // 手指停留开始多选
  onOpenChooseMark({detail}){
    this.selMarkers = [detail.mkID];

    let isSelAll = this.data.markers.length===1;

    this.setData({
      isMultiSel: true,
      curtSel: {[detail.mkID]: true},
      isSelAll
    });
  },

  // 勾选要删除的
  onCheckboxChange({detail}){
    this.selMarkers = detail.value;
    let isSelAll = this.selMarkers.length===this.data.markers.length;
    this.setData({
      isSelAll,
      curtSel: this.selMarkers.reduce((accu,elt)=>{
        accu[elt] = true;
        return accu;
      },{})
    })
  },
  onToggleAll(){

    let {isSelAll} = this.data;
    this.selMarkers =[];
    let curtSel = {};
    if(!isSelAll){
      this.selMarkers = this.data.markers.map(elt=>{
        curtSel[elt.id] = true;
        return elt.id
      });
    }

    this.setData({
      isSelAll: !isSelAll,
      curtSel

    });

  },
  onDelete(){
    if(!this.selMarkers.length) return;

    req.deleteMark({ids:this.selMarkers})
    .then(res=>{

      if(res.code===0){
        this._renderMksWithCache(res.data);
      };
      this._resetSelMarkers();
    })

  },
  onCancelSel(){
    this._resetSelMarkers();
  },
  // 添加一个地点标记
  onAddMark(){
    let {isSelf, userID} = this.data;
    if(!userID) return;
    api.navigateTo({
      url: path.url('/pages/mark/mark',{
        method: 'add',
        isSelf: true,
        userID
      })
    });
  },

})

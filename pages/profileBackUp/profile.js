const auth = require('../../api/auth');
const api = require('../../helper/api');
const req = require('../../api/req');

let p = 'https://pic.qqtn.com/up/2017-12/15138357828139708.jpg';

const app = getApp();

// query
//   userID 有说明是查看

Page({
  selMarkers: [],
  data: {
    userID: '',
    isSelf: true, //是查看自己还是好友
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

  onShareAppMessage({from, target}){
    return {
      title: '脚步与你',
      path: `/pages/profile/profile?userID=${this.data.userID}`
    }
  },

  onPullDownRefresh(){
    let {userID, isSelf} = this.data;
    this._renderProfile(userID, isSelf)
    .then(()=>{
      wx.stopPullDownRefresh();
    })
  },


  onLoad(query){
    this.query = query;
    let isSelf = !this.query.userID;
    this.setData({
      isSelf,
      userID: !isSelf ? this.query.userID : ''
    });

    if(!isSelf){
      this._renderProfile(this.query.userID, isSelf);
    }else{
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
      // end auth
    }
  },

  // 页面显示时候
  onShow(){
    let mks = wx.getStorageSync('markers');
    if(mks){
      this._renderMarkers(mks);
    }

  },
  _renderProfile(userID, isSelf){
    wx.showNavigationBarLoading();
    return req.getProfile(userID)
    .then(({code, data})=>{
      if(code===0){

        wx.hideNavigationBarLoading();
        this.setData({
          userInfo: data.userInfo
        });

        if(isSelf){
          this._renderMksWithCache(data.markers)
        }else{
          this._renderMarkers(data.markers);
        }
      }
    });
  },

  // 获取 markers
  _getMarkers(userID){
    return req.getMarkers(userID)
    .then(res=>{
      if(res.code!==0) console.log('没获取到 marker');
      return res;
    })
    .then(({data, code})=>code===0? data : []);
  },
  // 缓存并渲染 marker,
  _renderMksWithCache(mks){
    // 缓存 markers
    api.setStorage({
      key: 'markers',
      data: mks
    });
    this._renderMarkers(mks);
  },
  // 渲染 markers
  _renderMarkers(mks){
    this.setData({
      markers: mks.map(elt=>{

        return {
          id: elt._id,
          title: elt.title,
          lastTime: elt.events.length && elt.events[0].time,
          times: elt.events.length,
        }
      })
    });
  },

  onGetUserinfo({detail}){
    if(!detail.userInfo) return;
    this.setData({
      userInfo: detail.userInfo
    });
    req.saveUserInfo(detail.userInfo)
    .then(res=>{
      console.log(res);
    })
  },

  // 跳转到符号标记的地图页
  onGotoMark(e){
    let {userID, isSelf} = this.data;
    api.navigateTo({
      url: `/pages/mark/mark?method=check&userID=${userID}&isSelf=${isSelf}`
    });
  },
  // 根据 mark id 查看某个 mark 的详情
  onPlaceItemTap(e){
    let {isMultiSel,userID, isSelf} = this.data;
    if(isMultiSel){

    }else{
      let {id} = e.currentTarget;
      api.navigateTo({
        url: `/pages/mark/mark?id=${id}&method=check&userID=${userID}&isSelf=${isSelf}`
      });
    }

  },

  // 手指停留开始多选
  onOpenChooseMark(e){
    if(!this.data.isSelf) return;
    this.selMarkers = [e.currentTarget.id];

    let isSelAll = this.data.markers.length===1;

    this.setData({
      isMultiSel: true,
      curtSel: {[e.currentTarget.id]: true},
      isSelAll
    });
  },
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

    let isSelAll = this.data.isSelAll;
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
  _resetSelMarkers(){
    this.setData({
      isMultiSel: false,
      curtSel: {},
      isSelAll: false,

    });
    this.selMarkers = [];
  },

  // 添加一个地点标记
  onAddMark(){
    let {isSelf, userID} = this.data;
    api.navigateTo({
      url: `/pages/mark/mark?method=add&isSelf=${isSelf}&userID=${userID}`
    });
  },

})

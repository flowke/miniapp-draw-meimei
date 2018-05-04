const auth = require('../../api/auth');
const api = require('../../helper/api');
const req = require('../../api/req');

let p = 'https://pic.qqtn.com/up/2017-12/15138357828139708.jpg';

const app = getApp();

Page({
  data: {
    hasAuthUserInfo: true,
    userInfo: {},
    hasUserInfo: false,
    isShowAddingModel: false,
    markers: [],
  },

  onLoad(){

  },

  // 页面显示时候
  onShow(){

    let sid = wx.getStorageSync('sess-cookie');

    if(!sid){
      req.login()
      .then(id=>{
        // 同步 marker 信息
        this._syncMarkers();
      });
    }else{
      this._syncMarkers();
    }


    // start  auth
    auth('userInfo')
      .then(ret=>{
        // 授权成功

        if(app.globalData.userInfo){
          this.setData({
            hasAuthUserInfo: true,
            hasUserInfo: true,
            userInfo: app.globalData.userInfo
          });
        }else{
          // 获取用户信息
          api.getUserInfo({withCredentials: true})
          .then(ret=>{
            console.log(ret);
            this.setData({
              userInfo: ret.userInfo,
              hasAuthUserInfo: true,
              hasUserInfo: true
            });
            app.updateGlobalUserInfo(ret.userInfo)
          })
          .catch(e=>{
            // 获取用户信息失败
            console.log(e);
          });
        }
      })
      .catch(()=>{
        // 授权失败
        this.setData({
          hasAuthUserInfo: false
        });
      });

    // end auth

  },

  _syncMarkers(){

    try{
      let markers = wx.getStorageSync('markers');

      if(markers && markers.length){

        // 先使用缓存渲染
        this._setMarkerData(markers);
      }
    }catch(e){
      console.log('渲染缓存的 markers 失败');
    }

    // 请求 markers
    // 缓存并更新 markers
    try{
      let userID = wx.getStorageSync('userID');

      req.getMarkers({userID})
      .then((res)=>{

        let mks = res.data.data;

        // 缓存 markers
        api.setStorage({
          key: 'markers',
          data: mks
        });

        // 渲染 markers
        this._setMarkerData(mks)

      });
    }catch(e){
      console.log('远程获取 marker 失败');
    }


  },

  _setMarkerData(mks){
    this.setData({
      markers: mks.map(elt=>{

        return {
          id: elt._id,
          title: elt.title,
          lastTime: elt.events.length && elt.events[0].time,
          times: elt.events.length
        }
      })
    });
  },

  // 跳转到符号标记的地图页
  onGotoMark(e){
    api.navigateTo({
      url: `/pages/mark/mark?method=check`
    });
  },
  // 根据 mark id 查看某个 mark 的详情
  onCheckMark(e){
    let {id} = e.currentTarget;
    api.navigateTo({
      url: `/pages/mark/mark?id=${id}&method=check`
    });
  },

  // 添加一个地点标记
  onAddMark(){
    api.navigateTo({
      url: `/pages/mark/mark?method=add`
    });
  },

  // 用户在授权面板操作返回页面后调用
  // 期望授权用户信息
  // event 的 detail 参数为 bool
  // true 代表取得了授权
  // false 代表没取得授权
  onGetAuth(event){
    let {detail} = event;
    if(!detail){
      this.setData({
        hasAuthUserInfo: false
      });
    }

  },
  // 显示添加 symbol 的 model
  showAddModel(){

    this.setData({
      isShowAddingModel: true
    });
  },

  // 取消条件 symbol
  cancelAddSymbol(){
    this.setData({
      isShowAddingModel: false
    });
  },

  // 绑定输入框的值
  inputval(e){
    let {detail, target} = e;
    this.setData({
      [target.dataset.name]: detail.value
    })
  },

  //
  getLocation(ev){

  }

})

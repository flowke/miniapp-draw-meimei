const auth = require('../../api/auth');
const api = require('../../helper/api');

let p = 'https://pic.qqtn.com/up/2017-12/15138357828139708.jpg';

const app = getApp();

Page({

  data: {
    hasAuthUserInfo: true,
    userInfo: {},
    hasUserInfo: false,
    isShowAddingModel: false,
    symbols: [],
  },

  onLoad(){
    api.getStorage({key: 'symbols'})
      .then(({data})=>{
        this.setData({
          symbols: data
        })
      })
      .catch(e=>e);
  },

  // 页面显示时候
  onShow(){

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
  },

  // 跳转到符号标记的地图页
  gotoMark({target}){
    let {id} = target.dataset;
    api.navigateTo({
      url: `/pages/mark/mark?id=${id}`
    });
  },

  // 用户在授权面板操作返回页面后调用
  // 期望授权用户信息
  // event 的 detail 参数为 bool
  // true 代表取得了授权
  // false 代表没取得授权
  getAuth(event){
    let {detail} = event;
    this.setData({
      hasAuthUserInfo: false
    })
  },

  // 添加一个要标记的符号
  addSymbol(){
    let {symbols, inputSymbolName} = this.data;

    this.setData({
      isShowAddingModel: false,
      symbols: [
        {
          id: Math.random(),
          name: inputSymbolName
        },
        ...symbols
      ]
    },()=>{
      api.setStorage({
        key: 'symbols',
        data: this.data.symbols
      })
    });
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
    wx.login({
      success: ret=>{
        wx.request({
          url: 'http://localhost:3000/user/login',
          data: {code: ret.code},
          method: 'POST',
          success: (ret)=>{
            console.log(ret.data);
          }
        })
      }
    })
  }

})

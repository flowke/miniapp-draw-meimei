const auth = require('../../api/auth');
const api = require('../../helper/api');


Page({
  data: {
    hasAuthLocation: true,
    showLocate: {},
    markers: [],
    polyline: [],
    markerData:[],
    includePoints: {points:[]},
    markInfo: null,
    panelAniData: {}
  },
  onLoad(){

  },

  onReady(){
    this.mapctx = wx.createMapContext('map');

    this.panelAni = wx.createAnimation({
      duration: 0,
      timingFunction: 'ease-out',
    });
  },

  onShow(){

    auth('userLocation')
      .then(ret=>{
        console.log('授权了地址');
        api.getLocation({ type: 'gcj02'})
          .then(({latitude, longitude})=>{

            this.setData({
              showLocate: {
                latitude, longitude
              }
            });

          })
          .catch(e=>{
            console.log(e);
          });
        this.setData({
          hasAuthLocation: true
        });
      })
      .catch(e=>{

        this.setData({
          hasAuthLocation: false
        });


        console.log('没有地址授权');

      });
  },

  // 当从授权页面回了
  // 检查有没有地址授权
  getAuth({detail}){
    console.log(detail);
    if(detail){
      this.setData({
        hasAuthLocation: true
      });
    }
  },

  // 去到自己的位置
  toMyLocation(e){
    this.mapctx.moveToLocation();
  },

  // 记录一个地点
  chooseLocation(e){
    api.chooseLocation()
      .then(res=>{
        let {address, latitude, longitude, name} = res;
        console.log(name);
        let {markerData} = this.data;

        this.setData({

          showLocate: {
            latitude, longitude
          },
          markerData: [
            {
              id: Math.random(),
              address,
              latitude,
              longitude,
              name
            },
            ...markerData
          ]
        });

      });
  },

  // 点击 marker
  tapmarker({markerId}){

    // let marker = this.data.markerData.filter(e=>e.id===markerId)[0];

    let ani = this.panelAni.height('70%').step();
    this.setData({
      // markInfo: marker,
      panelAniData: ani.export()
    });
  },

  // 关闭 marker 详情面板
  closePanel(){

    let ani = this.panelAni.height(0).step();

    this.setData({
      markInfo: null,
      panelAniData: ani.export()
    });
  }

});

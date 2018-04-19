const auth = require('../../api/auth');
const api = require('../../helper/api');


Page({
  data: {
    hasAuthLocation: true,
    showLocate: {},
    markers: [],
    polyline: [],
    markerData:[],
    includePoints: {points:[]}
  },
  onLoad(){

  },

  onReady(){
    this.mapctx = wx.createMapContext('map');
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

  chooseLocation(e){
    api.chooseLocation()
      .then(res=>{
        let {address, latitude, longitude, name} = res;

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
        },()=>{
          this.mapctx.includePoints({
            points: this.data.markerData,
            padding: [40]
          })
        });

      });
  },

})

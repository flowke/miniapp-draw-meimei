const auth = require('../../api/auth');
const api = require('../../helper/api');

Page({
  data: {
    hasAuthLocation: true,
    initLocation: {},
    controls: [
      {
        id: 1,
        position: {
          left: 50,
          top: 500,
          width: 40,
          height: 40
        },
        clickable: true,
        iconPath: './img/location.png'
      }
    ]
  },
  onLoad(){

  },

  onShow(){

    auth('userLocation')
      .then(ret=>{
        console.log('授权了地址');
        api.getLocation({ type: 'gcj02'})
          .then(({latitude, longitude})=>{

            this.setData({
              initLocation: {
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

      })
  },

  getAuth({detail}){
    console.log(detail);
    if(detail){
      this.setData({
        hasAuthLocation: true
      });
    }
  },

  maptap(e){
    console.log(e);
    // let ctx = wx.createMapContext('map');
    api.chooseLocation()
  }
})

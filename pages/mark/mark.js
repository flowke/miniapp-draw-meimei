const auth = require('../../api/auth');
const api = require('../../helper/api');

Page({
  data: {
    hasAuthLocation: true,
    initLocation: {

    }
  },
  onLoad(){

  },

  onShow(){
    console.log('show mark');
    auth('userLocation')
      .then(ret=>{
        console.log('授权了地址');
        api.getLocation({ type: 'gcj02'})
          .then(({latitude, longitude})=>{

            this.setData({
              initLocation: {
                latitude, longitude
              }
            })
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
  }
})

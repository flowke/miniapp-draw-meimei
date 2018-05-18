const auth = require('../../api/auth');
const api = require('../../helper/api');
const req = require('../../api/req');
module.exports = {
  enents: {
    onShareAppMessage({from, target}){
      return {
        title: '脚步与你',
        path: `/pages/checkProfile/check-profile?userID=${this.data.userID}`
      }
    },

    onPullDownRefresh(){
      let {userID, isSelf} = this.data;
      this._renderProfile(userID, isSelf)
      .then(()=>{
        wx.stopPullDownRefresh();
      })
    },
  },
  methods: {
    // 渲染 整个页面数据
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

    _resetSelMarkers(){
      this.setData({
        isMultiSel: false,
        curtSel: {},
        isSelAll: false,

      });
      this.selMarkers = [];
    },

  }
};

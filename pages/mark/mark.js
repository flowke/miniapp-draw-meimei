const auth = require('../../api/auth');
const api = require('../../helper/api');
const util = require('../../utils/util');

Page({
  data: {
    hasAuthLocation: true,
    showLocate: {},
    markers: [],
    polyline: [],
    markerData:[],
    includePoints: {points:[]},
    markInfo: null,
    panelAniData: {},
    // 是否显示添加事件面板
    isShowIncidentPanel: false,
    // 临时使用的事件数据, 以后从后端获取
    incidents:[],
    // 事件的事件
    incidentTime: 0,
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
  },

  // 打开添加事件面板
  onShowIncidentPanel(){
    console.log(999);
    this.setData({
      isShowIncidentPanel: true,
      incidentTime:  util.DateTo(new Date())
    });
  },
  // 关闭添加事件面板
  onHideIncidentPanel(){
    this.setData({
      isShowIncidentPanel: false
    })
  },
  // 保存一个事件
  onSaveIincident(){
    let {
      incidentTime,
      incidents
    } = this.data;

    let {incident_desc} = this.input;

    this.setData({
      isShowIncidentPanel: false,
      incidents: [
        {
          id: Math.random(),
          time: incidentTime,
          content: incident_desc
        },
        ...incidents
      ]
    })

  },
  // 事件编辑描述输入
  onIncidentDescInput(e){
    let {name} = e.target.dataset;
    this.input[name] = e.detail.value;
  },
  // 时间选择
  onSelectTime(ev){

    this.setData({
      incidentTime: ev.detail.value
    });
  },
  // 编辑事件
  onEditIncident(e){
    let {id} = e.target.dataset;
    let incident = this.data.incidents.filter(elt=>elt.id===id)[0];

    this.setData({
      isShowIncidentPanel: true,
    });
  }
});

const auth = require('../../api/auth');
const api = require('../../helper/api');
const util = require('../../utils/util');
const qqmapAPI =api.createQQMap('R4EBZ-JG43O-M67WY-SAGOA-ABUKV-IYFN7');


Page({
  // 所有的输入框的值
  input: {},
  query: {},
  // 事件修改框弹出时,
  // 如果此有id值, 说明是修改某个事件
  // 是 null 则会
  whichToFix: null,
  data: {
    hasAuthLocation: true,
    showLocate: {},
    markers: [],
    polyline: [],
    markerData:[],
    includePoints: {points:[]},
    markInfo: null,
    // 详情面板中标题,如: 国贸
    markTitle: '',
    // 详情面板中地址
    markAddress: '',
    // 详情面板弹出动画数据
    panelAniData: {},
    // 是否显示添加事件面板
    isShowIncidentPanel: false,
    // 临时使用的事件数据, 以后从后端获取
    incidents:[],
    // 编辑事件的时间
    incidentTime: 0,
    // 编辑时间的描述
    incidentDesc: ''
  },
  onLoad(query){
    this.query = query;


  },

  onReady(){
    this.mapctx = wx.createMapContext('map');

    this.panelAni = wx.createAnimation({
      duration: 0,
      timingFunction: 'ease-out',
    });

    let {method} = this.query;

    if(method==='add'){
      this.toMyLocation();
      this._openDetail();
      api.getLocation({type: 'gcj02'})
        .then(res=>{

          this._chooseQQMapLocation({
            latitude: res.latitude,
            longitude: res.longitude
          });
        });
    }

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

  _openDetail(){
    let ani = this.panelAni.height('70%').step();
    this.setData({
      // markInfo: marker,
      panelAniData: ani.export()
    });
  },

  // 点击 marker
  tapmarker({markerId}){

    // let marker = this.data.markerData.filter(e=>e.id===markerId)[0];

    this._openDetail();
  },
  // 改变 mark 详情 title
  onChangeTitle(){

  },
  // 改变 mark 详情 地址
  onChooseLocation(){

    api.chooseLocation()
      .then(res=>{
        console.log(res, 'on');
        this._chooseQQMapLocation({
          latitude: res.latitude,
          longitude: res.longitude
        })
      });

  },

  _chooseQQMapLocation(location){
    return qqmapAPI.reverseGeocoder({location})
      .then(({result})=>{
        console.log(result);
        let {address_reference, formatted_addresses} = result;
          let title = '';

          if(address_reference.famous_area){
            title = address_reference.famous_area.title;
          }else if(address_reference.landmark_l1){
            title = address_reference.landmark_l1.title;
          }else if(address_reference.landmark_l2){
            title = address_reference.landmark_l2.title;
          }

          this.setData({
            markTitle: title,
            markAddress: formatted_addresses.recommend,
          });
      })
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

    this.setData({
      isShowIncidentPanel: true,
      incidentTime:  util.DateTo(new Date())
    });
  },
  // 关闭添加事件面板
  onHideIncidentPanel(){
    this.setData({
      isShowIncidentPanel: false
    });
    this.whichToFix = null;
  },
  // 保存一个事件
  onSaveIincident(){
    let {
      incidentTime,
      incidents,
    } = this.data;

    let {incident_desc} = this.input;

    if(!this.whichToFix){
      this.setData({
        isShowIncidentPanel: false,
        incidents: [
          {
            id: Math.random().toString(),
            time: incidentTime,
            content: incident_desc
          },
          ...incidents
        ]
      });
    }else{
      this.setData({
        isShowIncidentPanel: false,
        incidents: incidents.map(elt=>{
          if(elt.id===this.whichToFix) {
            elt.time = incidentTime;
            elt.content = incident_desc;
          };
          return elt;
        })
      })
    }
    // 重置编辑框的修改与保存状态
    this.whichToFix = null;
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

    let {id} = e.currentTarget;
    this.whichToFix = id;
    let incident = this.data.incidents.filter(elt=>elt.id===id)[0];

    this.setData({
      isShowIncidentPanel: true,
      incidentTime: incident.time,
      incidentDesc: incident.content
    });
  }
});

const auth = require('../../api/auth');
const api = require('../../helper/api');
const req = require('../../api/req');
const util = require('../../utils/util');
const qqmapAPI =api.createQQMap('R4EBZ-JG43O-M67WY-SAGOA-ABUKV-IYFN7');


Page({
  // 所有的输入框的值
  input: {},
  // 地址的 query
  query: {},
  // 事件修改框弹出时,
  // 如果此有id值, 说明是修改某个事件
  // 是 null 则会当前是添加个新的
  whichToFix: null,

  // 打开详情面板时
  // 是否为 编辑未被持久化的 marker
  isEidtNewOne: false,

  data: {
    hasAuthLocation: true,
    showLocate: {},
    polyline: [],
    markerData:[],
    includePoints: {points:[]},
    lat: null,
    lng: null,
    // 新添加一个 marker 时, 会显示保存按钮
    isShowSaveButton: false,
    // 详情面板中标题,如: 国贸
    detailPanelInfo: {
      markerID: null,
      latitude: 0,
      longitude: 0,
      title: '',
      address: '', // 详情面板中地址
      isShowIncidentPanel: false, // 是否显示添加事件面板
      incidents: [], // 临时使用的事件数据, 以后从后端获取
      incidentTime: 0, // 编辑事件的时间
      incidentDesc: '', // 编辑时间的描述
    },
    // 信息面板的弹出收起动画数据
    panelAniData: {},
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

    if(this._isAddMarker()){

      this._showDetailPanelByAdd();

    }else if(this._isCheckCertainMarker()){

      let {id} = this.query;
      this._showDetailPanelByCheck(id);

    }else if(this._isOnlyCheckInMap()){

      this._toMyLocation();
    }

  },

  onShow(){

    // 渲染 markers

    let markers = wx.getStorageSync('markers');

    if(markers){
      this.setData({
        markerData: markers
      })
    }

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
  // 进入地图页面的情景 -->
  // 单纯进入滴入查看地图
  _isOnlyCheckInMap(){
    let {method,id} = this.query;
    return method === 'check' && !id;
  },
  // 查看某一个 marker
  _isCheckCertainMarker(){
    let {method,id} = this.query;
    return method === 'check' && !!id;
  },
  // 是否是添加 marker
  _isAddMarker(){
    let {method} = this.query;
    return method === 'add';
  },
  // <---

  // 打开 marker 详情面板的情景 -->
  // 添加一个 marker 而打开
  _showDetailPanelByAdd(){
    this.isEidtNewOne = true;
    this._toMyLocation();
    this._openDetail();

    let {detailPanelInfo} = this.data;

    api.getLocation({type: 'gcj02'})
    .then(res=>{
      return this._getQQMapLocation({
        latitude: res.latitude,
        longitude: res.longitude
      })
      .then(addrInfo=>{
        this.setData({
          detailPanelInfo: {
            ...detailPanelInfo,
            ...addrInfo,
          }
        })
      })
    });

    this.setData({
      isShowSaveButton: true
    });
  },
  // 查看某个 marker 而打开
  _showDetailPanelByCheck(id){
    this.isEidtNewOne = false;
    let markers = wx.getStorageSync('markers');
    let marker = markers.filter(elt=>elt._id===id)[0];

    this._openDetail();
    this.setData({
      lat: marker.latitude,
      lng: marker.longitude,
      detailPanelInfo: {
        markerID: id,
        title: marker.title,
        address: marker.address,
        incidents: marker.events,
      }
    });
  },
  // <---

  // 展开 mark 信息面板
  _openDetail(){
    let ani = this.panelAni.height('70%').step();
    this.setData({
      panelAniData: ani.export()
    });
  },

  // 收起 mark 信息面板
  _closeDetail(){
    let ani = this.panelAni.height(0).step();
    this.setData({
      panelAniData: ani.export(),
      isShowSaveButton: false
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
  _toMyLocation(e){
    this.mapctx.moveToLocation();
  },

  // 点击 marker
  onMarkerTap({markerId}){
    this._showDetailPanelByCheck(markerId);
  },

  // 详情面板的编辑 -->

  // 改变 panel 显示的地址
  onChooseLocation(){

    api.chooseLocation()
    .then(res=>{
      return this._getQQMapLocation({
        latitude: res.latitude,
        longitude: res.longitude
      })
    })
    .then(addrInfo=>{
      let {detailPanelInfo: info} = this.data;

      if(this.isEidtNewOne){
        // 是在一个新的 marker 里修改地址
        this.setData({
          detailPanelInfo: {
            ...info,
            ...addrInfo,
          }
        });

      }else{
        // 如果是在一个已经持久化的 marker 里修改地址
        req.editMarkerAddress({
          markerID: info.markerID,
          ...addrInfo
        })
        .then(markers=>{

          this.setData({
            markerData: markers,
          })
        })
      }
    });
  },

  // 传入 经纬度
  // 得到地址的title 和 详情地址
  _getQQMapLocation(location){
    return qqmapAPI.reverseGeocoder({location})
      .then(({result})=>{

        let {detailPanelInfo} = this.data;

        let {address_reference, formatted_addresses} = result;
        let title = '';

        if(address_reference.famous_area){
          title = address_reference.famous_area.title;
        }else if(address_reference.landmark_l1){
          title = address_reference.landmark_l1.title;
        }else if(address_reference.landmark_l2){
          title = address_reference.landmark_l2.title;
        }

        return {
          title,
          address: formatted_addresses.recommend,
          ...location
        };
      });
  },

  // 关闭 marker 详情面板
  onClosePanel(){
    this._closeDetail();
  },

  // 保存一个新添加的标记点
  // 会请求服务器
  onSaveMark(){

    let {
      latitude,
      longitude,
      title,
      address,
      incidents,
    } = this.data.detailPanelInfo;

    let userID = wx.getStorageSync('userID');

    req.addMark({
      latitude,
      longitude,
      title,
      address,
      incidents,
      userID
    })
    .then(res=>{
      let markers = res.data.data;

      this._closeDetail();

      this.setData({
        markerData: markers
      });
    })

  },

  // 打开添加事件面板
  onShowIncidentPanel(){
    let {detailPanelInfo} = this.data;
    this.setData({
      detailPanelInfo: {
        ...detailPanelInfo,
        isShowIncidentPanel: true,
        incidentTime:  util.DateTo(new Date())
      }

    });
  },
  // 关闭添加事件面板
  onHideIncidentPanel(){
    let {detailPanelInfo} = this.data;
    this.setData({
      detailPanelInfo: {
        ...detailPanelInfo,
        isShowIncidentPanel: false
      }

    });
    this.whichToFix = null;
  },

  // 保存一个事件
  // 可能是添加一个事件,
  // 也可能是修改某个事件
  onSaveIincident(){
    let {
      detailPanelInfo,
      detailPanelInfo: {
        incidentTime,
        incidents,
      }
    } = this.data;

    let {incident_desc} = this.input;

    // 如果是添加一个
    if(!this.whichToFix){
      this.setData({
        detailPanelInfo: {
          ...detailPanelInfo,
          isShowIncidentPanel: false,
          incidents: [
            {
              _id: Math.random().toString(),
              time: incidentTime,
              content: incident_desc
            },
            ...incidents
          ]
        }
      });
    }else{
      this.setData({
        detailPanelInfo: {
          ...detailPanelInfo,
          isShowIncidentPanel: false,
          incidents: incidents.map(elt=>{
            if(elt._id===this.whichToFix) {
              elt.time = incidentTime;
              elt.content = incident_desc;
            };
            return elt;
          })
        }
      });
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

    let {detailPanelInfo} = this.data;
    let {incident_desc} = this.input;

    this.setData({
      detailPanelInfo: {
        ...detailPanelInfo,
        incidentTime: ev.detail.value,
        incidentDesc: incident_desc
      }

    });
  },
  // 编辑事件
  onEditIncident(e){

    let {id} = e.currentTarget;

    // 告知当前事件框是在修改某个已经存在的事件事件
    this.whichToFix = id;

    let {detailPanelInfo} = this.data;

    let incident = detailPanelInfo.incidents.filter(elt=>elt._id===id)[0];

    this.setData({
      detailPanelInfo: {
        ...detailPanelInfo,
        isShowIncidentPanel: true,
        incidentTime: incident.time,
        incidentDesc: incident.content
      }
    });
  }
});

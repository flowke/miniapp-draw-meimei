const auth = require('../../api/auth');
const api = require('../../helper/api');
const req = require('../../api/req');
const util = require('../../utils/util');
const qqmapAPI =api.createQQMap('R4EBZ-JG43O-M67WY-SAGOA-ABUKV-IYFN7');

// query
// id: markerId
// userID
// method: check / add

Page({
  // 所有的输入框的值
  input: {},
  // 地址的 query
  query: {},

  data: {
    isSelf: false,
    userID: '',
    hasAuthLocation: true,
    showLocate: {
      longitude: 116,
      latitude: 40
    },
    polyline: [],
    markerData:[],
    includePoints: {points:[]},
    lat: 0,
    lng: 0,
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
      eventID: null,
      incidentTime: 0, // 编辑事件的时间
      incidentDesc: '', // 编辑时间的描述
    },
    // 信息面板的弹出收起动画数据
    panelAniData: {},
  },
  onLoad(query){
    this.query = {
      ...query,
      isSelf: query.isSelf==='true'
    };
    this.setData({
      isSelf: query.isSelf==='true'
    })
  },

  onReady(){
    this.mapctx = wx.createMapContext('map');

    this.panelAni = wx.createAnimation({
      duration: 0,
      timingFunction: 'ease-out',
    });

    let { id:markerID} = this.query;
    let { isSelf, userID, }= this.data;

    // 如果是自己
    if(isSelf){
      let markers = wx.getStorageSync('markers');

      if(markers){
        this.setData({
          markerData: markers
        })
      };

      if(this._isAddMarker()){
        this._showDetailPanelByAdd();

      }else if(this._isCheckCertainMarker()){
        this._showDetailPanelByCheck(markerID, markers, true);


      }else if(this._isOnlyCheckInMap()){
        this._toMyLocation();
      }

    // 如果不是自己, 只是查看别人
    }else{

      req.getMarkers(userID)
      .then(res=>{
        if(res.code===0){
          this.setData({
            markerData: res.data
          });
          return res.data
        }
      })
      .then(mks=>{
        // 查看某个 marker
        if(mks && this._isCheckCertainMarker()){
          this._showDetailPanelByCheck(markerID, mks, true);

        // 只是进入地图
        }else if(mks && this._isOnlyCheckInMap()){
          this._toMyLocation();
        }
      });
    }

  },

  onShow(){

    // 渲染 markers

    auth('userLocation')
      .then(ret=>{
        console.log('授权了地址');
        api.getLocation({ type: 'gcj02'})
          .then(({latitude, longitude})=>{

            // longitude="{{showLocate.longitude}}"
            // latitude="{{showLocate.latitude}}"
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
  // 更新 detail面板
  _updDetailPanelAfterReq(mks, mkID){
    wx.setStorageSync('markers',mks);
    this.setData({
      markerData: mks
    });
    let marker = this._findMarkerByID(mks, mkID);
    this._renderDetailPanel(marker);
  },
  // 查看某个 marker 而打开
  // isIncludePoints: 地图显示此 marker 图标区域
  // id: markerId
  // mks
  _showDetailPanelByCheck(id, mks, isIncludePoints=false){

    this._openDetail();
    let marker = this._findMarkerByID(mks, id);
    this._renderDetailPanel(marker);

    if(isIncludePoints){
      this._showIncludePoints([
        {
          latitude: marker.latitude,
          longitude: marker.longitude,
        }
      ]);
    }
  },
  _showIncludePoints(points){
    this.mapctx.includePoints({
      points,
      padding: [150]
    })
  },
  _findMarkerByID(markers, mkID){
    return markers.find(elt=>elt._id===mkID);
  },
  // 渲染 marker 到详情面板
  _renderDetailPanel(marker){
    this.setData({
      detailPanelInfo: {
        latitude: marker.latitude,
        longitude: marker.longitude,
        markerID: marker._id,
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
    this._resetDetailPanel();
  },

  // 详情面板的打开的情形
  // true 为正在进行添加一个 marker, 数据没有持久化
  // false 为正在查看某个已经持久化的 marker
  _isNewMarker(){
    return !this.data.detailPanelInfo.markerID;
  },
  // 重置 事件编辑面板 信息
  _resetDetailPanel(){
    this.setData({
      detailPanelInfo: {
        markerID: null,
        latitude: 0,
        longitude: 0,
        title: '',
        address: '', // 详情面板中地址
        isShowIncidentPanel: false, // 是否显示添加事件面板
        incidents: [], // 临时使用的事件数据, 以后从后端获取
        eventID: null,
        incidentTime: 0, // 编辑事件的时间
        incidentDesc: '', // 编辑时间的描述
      }
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
  _toMyLocation(){
    this.mapctx.moveToLocation();
    console.log('msto');
  },

  onToMyLocation(){
    this._toMyLocation();
  },

  onAddMark(){
    this._showDetailPanelByAdd();
  },

  // 点击 marker
  onMarkerTap(ev){
    let {markerData} = this.data;
    this._showDetailPanelByCheck(ev.markerId,markerData);
  },

  // 详情面板的编辑 -->

  // 改变 panel 显示的地址
  onChooseLocation(){
    if(!this.data.isSelf) return;
    api.chooseLocation()
    .then(res=>{
      console.log(res);
      if(res.name && res.address){
        return {
          title: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        }
      }else{
        return this._getQQMapLocation({
          latitude: res.latitude,
          longitude: res.longitude
        })
      }

    })
    .then(addrInfo=>{
      let {detailPanelInfo: info} = this.data;

      if(this._isNewMarker()){
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
        .then(({data, code})=>{
          if(code===0){
            this._updDetailPanelAfterReq(data, info.markerID)
          }
        })
      }
    });
  },
  onDeleteMarker(){
    if(!this.data.isSelf) return;
    if(!this.data.detailPanelInfo.markerID) return;
    let {markerID} = this.data.detailPanelInfo;
    api.showModal({
      content: '确定删除本记录么',
      confirmColor: '#ED3333'
    })
    .then(res=>{
      if(!res.cancel){
        req.deleteMark({ids:[markerID]})
        .then(res=>{
          if(res.code===0){

            this._closeDetail();
            wx.setStorageSync('markers', res.data);
            this.setData({
              markerData: res.data
            });
          };
        })
      }

    })
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

    req.addMark({
      latitude,
      longitude,
      title,
      address,
      incidents: incidents.map(elt=>{
        let {_id,...rest} = elt;
        return rest;
      })
    })
    .then(res=>{
      let markers = res.data.data;

      this._closeDetail();
      wx.setStorageSync('markers', markers);
      this.setData({
        markerData: markers
      });
    })

  },

  // 打开事件编辑面板
  // 点击添加事件调用
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
  // 打开事件编辑面板
  // 点击某个事件调用
  onEditIncident(e){
    if(!this.data.isSelf) return;
    let {id} = e.currentTarget;

    let {detailPanelInfo} = this.data;

    let incident = detailPanelInfo.incidents.filter(elt=>elt._id===id)[0];

    this.setData({
      detailPanelInfo: {
        ...detailPanelInfo,
        eventID: id,
        isShowIncidentPanel: true,
        incidentTime: incident.time,
        incidentDesc: incident.content
      }
    });
    this.input.incident_desc = incident.content;
  },
  // 保存一个事件
  // 可能是添加一个事件,
  // 也可能是修改某个事件
  onSaveIncident(){
    let {
      detailPanelInfo,
      detailPanelInfo: {
        markerID,
        eventID,
        incidentTime,
        incidents,
      }
    } = this.data;

    let incidentDesc = this.input.incident_desc;

    let {incident_desc} = this.input;

    // new marker 降不会持久化数据
    if(this._isNewMarker()){
      if(this._isNewEvent()){
        this.setData({
          detailPanelInfo: {
            ...detailPanelInfo,
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
            incidents: incidents.map(elt=>{
              if(elt._id===markerID) {
                elt.time = incidentTime;
                elt.content = incident_desc;
              };
              return elt;
            })
          }
        });
      }
    }else{
      // 持久化数据
      if(this._isNewEvent()){
        req.addEvent({
          markerID,
          incidentTime,
          incidentDesc
        })
        .then(({code,data})=>{
          if(code===0){
            this._updDetailPanelAfterReq(data, markerID);
          }
        })
      }else{
        req.editEvent({
          markerID,
          eventID,
          incidentTime,
          incidentDesc
        })
        .then(({data, code})=>{
          if(code===0){

              this._updDetailPanelAfterReq(data, markerID);
          }

        })
      }
    }

    // 重置编辑框的修改与保存状态
    this._hideEventPanel();
  },

  onDeleteIncident({currentTarget:el}){
    let {markerID, incidents} = this.data.detailPanelInfo;
    if(!this.data.isSelf) return;

    let {id: eventID} = el;
    api.showModal({
      content: '确定要删除这个事件么'
    })
    .then(res=>{
      if(!res.cancel){
        // 有markerID, 删除已经持久化的数据
        // 否则删除本地 data 的数据
        if(markerID){
          req.deleteEvent({
            eventID,
            markerID
          })
          .then(res=>{
            if(res.code===0){
              this._updDetailPanelAfterReq(res.data, markerID)
            }
          });
        }else{
          this.setData({
            detailPanelInfo: {
              ...this.data.detailPanelInfo,
              incidents: incidents.filter(event=>event._id!==eventID)
            }
          })
        }
      };
    })






  },
  // 关闭编辑事件面板
  // 点击事件面板取消调用
  onHideIncidentPanel(){
    this._hideEventPanel();
  },

  _hideEventPanel(){
    let {detailPanelInfo} = this.data;
    this.setData({
      detailPanelInfo: {
        ...detailPanelInfo,
        isShowIncidentPanel: false,
        eventID: null,
        incidentTime: 0,
        incidentDesc: '',
      }
    });
    this.input.incident_desc = '';
  },

  // 是新添加一个事件还是修改某个事件而弹出事件编辑面板
  _isNewEvent(){
    return !this.data.detailPanelInfo.eventID;
  },
  // 重置 事件编辑面板 信息
  _resetEventPanel(){
    let {detailPanelInfo} = this.data;
    this.setData({
      detailPanelInfo: {
        ...detailPanelInfo,
        eventID: null,
        incidentTime: 0,
        incidentDesc: '',
      }
    });
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

});

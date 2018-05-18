const auth = require('../../../api/auth');
const api = require('../../../helper/api');
const req = require('../../../api/req');
const path = require('../../../api/path');

let p = 'https://pic.qqtn.com/up/2017-12/15138357828139708.jpg';

const app = getApp();

// query
//   userID 有说明是查看

Component({
  properties: {
    isSelf: Boolean, //是查看自己还是好友
    userID: String,
    userInfo: Object,
    markers: Array,
    hasReqAuth: Boolean,
    // 是否切换为选择删除模式模式
    isMultiSel: Boolean,
    // 当前选中的
    curtSel: Object,
    // 是否为全部选择
    isSelAll: Boolean,
  },

  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },

  methods: {
    // 根据 mark id 查看某个 mark 的详情
    onPlaceItemTap(e){
      let {isMultiSel, userID, isSelf} = this.data;
      if(!isMultiSel || !userID){
        let {id} = e.currentTarget;
        api.navigateTo({
          url: path.url('/pages/mark/mark',{
            id,
            method: 'check',
            userID,
            isSelf
          })
        });
      }

    },

    // 跳转到符号标记的地图页
    onGotoMark(e){
      let {userID, isSelf} = this.data;

      if(!userID) return;
      api.navigateTo({
        url: path.url('/pages/mark/mark', {
          method: 'check',
          userID,
          isSelf
        })
      });
    },

    // 用户自己使用
    onGetUserinfo({detail}){
      this.triggerEvent('get_user_info', {...detail});
    },

    // 手指停留开始多选
    onOpenChooseMark({currentTarget:{id}}){
      this.triggerEvent('open_choose_mark', {mkID:id});
    },

    onCheckboxChange({detail}){
      this.triggerEvent('checkbox_change', detail);
    },
    onToggleAll(){
      this.triggerEvent('toggle_all');
    },
    onDelete(){
      this.triggerEvent('delete');
    },
    onCancelSel(){
      this.triggerEvent('cancel_sel');
    },
    onAddMark(){
      this.triggerEvent('add_mark');
    }
  },
})

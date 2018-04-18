const api = require('../../../helper/api');

Component({
  properties: {
    scope: {
      type: String
    }
  },
  methods: {
    openSetting(){
      // 确定期望授权的 scope
      let {scope} = this.properties;
      api.openSetting()
        .then(({ authSetting })=>{
          let isAuth = authSetting[`scope.${scope}`];
          this.triggerEvent('getAuth', isAuth);
        });
    }
  }
})

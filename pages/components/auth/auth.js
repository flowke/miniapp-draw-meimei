const api = require('../../../helper/api');
const auth = require('../../../api/auth');

Component({
  properties: {
    scope: String,
    hintString: String
  },

  methods: {
    onAuth(){
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

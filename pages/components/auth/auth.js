const api = require('../../../helper/api');
const auth = require('../../../api/auth');

Component({
  properties: {
    scope: {
      type: String
    }
  },

  methods: {
    onAuth(){
      // 确定期望授权的 scope
      let {scope} = this.properties;

      auth(scope)
      .then(()=>{
        this.triggerEvent('getAuth', true);
        console.log('done');
      })
      .catch(()=>{
        console.log('fali');
        api.openSetting()
        .then(({ authSetting })=>{

          let isAuth = authSetting[`scope.${scope}`];
          this.triggerEvent('getAuth', isAuth);
        });

      })

    }
  }
})

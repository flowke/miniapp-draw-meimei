const api = require('../helper/api');

module.exports = ()=>{
  return api.getSetting()
    .then(({authSetting})=>{
      if(!authSetting['scope.userInfo']){
        return api.authorize({scope: 'scope.userInfo'});
      }
    });
};

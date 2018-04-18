const api = require('../helper/api');

module.exports = function(scope){
  return api.getSetting()
    .then(({authSetting})=>{
      if(!authSetting[`scope.${scope}`]){
        return api.authorize({scope: `scope.${scope}`});
      }
    });
}

const api = require('../helper/api');

module.exports = function(scope){
  return api.getSetting()
    .then(({authSetting})=>{
      // 如果没有授权, 期望取得授权
      if(!authSetting[`scope.${scope}`]){
        return api.authorize({scope: `scope.${scope}`});
      }else{
        return true
      }
    });
}


module.exports.getAuth = (scope)=>{
  return api.getSetting()
    .then(({authSetting})=>!!authSetting[`scope.${scope}`]);
}

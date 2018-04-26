const api = require('../helper/api');

const baseURL = 'http://localhost:3000'

let get = (url, data)=>{
  return api.request({
    url: baseURL + url,
    data
  });
}
let post = (url, data)=>{
  return api.request({
    url: baseURL + url,
    method: 'POST',
    data
  });
}

// 请求保存 mark
exports.addMark = (data)=>post('/mark/add', data);

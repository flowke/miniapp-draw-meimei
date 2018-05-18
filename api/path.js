module.exports = {
  ify(obj={}){
    let op=[];
    for (let key in obj) {
      op.push(`${key}=${obj[key]}`)
    }
    return op.length? '?'+op.join('&') : '';
  },
  url(url, query){
    return url+this.ify(query);
  }
};

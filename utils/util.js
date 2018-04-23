const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const DateTo = date=>{
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return [year, month, day].join('-');

}
const toIncidentTime = date=>{
  date = date.split('-');


  let year = parseInt(date[0]),
      month = parseInt(date[1]),
      day = parseInt(date[2]);

  return `${year}年 ${month}月 ${day}日`

}
const DateToIncidentTime = date=>{
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}年 ${month}月 ${day}日`

}

module.exports = {
  formatTime: formatTime,
  DateTo,
  toIncidentTime,
  DateToIncidentTime
}

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  let res = await db.collection('bless').where({
    _id: '058dfefe62de6c900f1581e01b77e49a',
    "bless_list.id": event.id
  }).update({
    data: {
      'bless_list.$.likeList': _.push(event.openid),
      'bless_list.$.likesNum': _.inc(1)
    }
  })
  return res
}
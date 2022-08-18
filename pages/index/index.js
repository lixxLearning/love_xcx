// index.js
import {
  APPID,
} from "../../utils/constants";
import {
  _cloud
} from "../../utils/http";
import {
  load,
  save
} from "../../utils/storage";
// 获取应用实例
const app = getApp()

app.Page({
  data: {
    days: 0,
    indexData: {},
    userInfo: {},
    bgUrl: "../../images/login_bg2.png",
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    this.userInfo = load("userInfo");
    this.getData();
    this.getDays();
    if (this.userInfo) return;
  },
  getDays() {
    const day_time = 1000 * 60 * 60 * 24;
    this.setData({
      days: ~~((Date.now() - this.getTime('2015-02-14')) / day_time)
    })
  },
  getTime(date) {
    return new Date(date).getTime();
  },
  getData() {
    _cloud("getData", {}, this).then(res => {
      const data = res?.data?.[0] || {};
      if (!data._id) {
        this.$error('读取数据失败！');
        return
      }
      // 存储上限10mb，单个key 1mb 所以删除该字段，数据量多的只能每次从云后台查询
      // TODO
      delete data.bless_list;
      save("blessData", data);
      this.setData({
        indexData: data.indexData || {}
      })
    });
  },
  uploadimg() {
    //声明this，这里面嵌套的太多，里面拿不到this
    let _that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        console.log("res ==", res);
        const tempFilePaths = res.tempFilePaths;
        const extName = res.tempFilePaths[0].split(".").pop();
        const cloudPath = new Date().getTime() + '.' + extName;
        wx.cloud.uploadFile({
          cloudPath: 'homeswiper/' + cloudPath, // 上传至云端的路径 图片
          filePath: tempFilePaths[0], // 小程序临时文件路径
          success: res => {
            // 返回文件 ID
            console.log("文件 ID ===", res.fileID);
            _that.setData({
              selctedimg: res.fileID
            })
          },
          fail: console.error
        })
      }
    })
  },
  toHome() {
    wx.switchTab({
      url: '../home/home',
    })
  },
  getPhoneNumber(e) {
    console.log("getPhoneNumber ===", e);
  },
  getUserProfile(e) {
    console.log("userInfo", this.userInfo);
    if (!this.userInfo) {
      wx.getUserProfile({
        desc: '获取你的个人信息用于信息注册！',
        success: (res) => {
          if (res?.userInfo) {
            // 获取用户id
            _cloud("getOpenid", {}, this).then(res2 => {
              console.log("用户openid", res2);
              res.userInfo.openid = res2?.openid;
              save("userInfo", {
                ...(res.userInfo || {}),
                nickName: res.userInfo.nickName,
                avatarUrl: res.userInfo.avatarUrl
              });
              wx.switchTab({
                url: '../home/home',
              });
              return;
            })
            return;
          }
          this.$error('获取用户信息失败！');
        },
        fail: err => {
          wx.showModal({
            title: '提示',
            content: '是否以匿名形式进入',
            success(res) {
              if (res.confirm) {
                // 获取用户id
                _cloud("getOpenid", {}, this).then(res2 => {
                  console.log("用户openid", res2);
                  const userInfo = {
                    openid: res2?.openid,
                    nickName: '一位不愿透露姓名的人士',
                    avatarUrl: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fi.qqkou.com%2Fi%2F3a3241284626x3647914565b26.jpg&refer=http%3A%2F%2Fi.qqkou.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1661948543&t=a6f2521ee336f2e945d4da6af4e4656a'
                  };
                  save("userInfo", userInfo);
                  wx.switchTab({
                    url: '../home/home',
                  });
                  return;
                });
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      })
    } else {
      wx.switchTab({
        url: '../home/home',
      });
    }
  }
})
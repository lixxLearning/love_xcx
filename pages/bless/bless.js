import { load } from "../../utils/storage";

// pages/home/home.js
const app = getApp();
app.Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,
    list: [],
    swiperList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const blessData = load("blessData") || {};
    this.setData({
      swiperList: blessData.swiperList || []
    })
  },

  open() {
    if (this.data.isShow) {
      this.setData({
        showLetter: true
      })
      return;
    }
    this.setData({
      isShow: true
    })
  },

  close() {
    this.setData({
      isShow: false,
      showLetter: false
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    clearInterval(this.timer);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },
})
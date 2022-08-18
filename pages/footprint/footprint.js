import { PAGE_SIZE } from "../../utils/constants";
import { load } from "../../utils/storage";

const app = getApp();
app.Page({

  /**
   * 页面的初始数据
   */
  data: {
    maxPage: 1,
    intoView: '',
    isAnimation: true,
    _list: [],
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.refContext(this);
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
    const _list = load("time_line") || [];
    const total = load("total") || 0;
    console.log("onShow ==", _list);
    this.setData({
      isAnimation: true,
      _list,
      list: [],
      pageSize: PAGE_SIZE,
      maxPage: Math.ceil(total/PAGE_SIZE),
      total,
    }, () => {
      this.setData({
        page: 1
      })
    })
  },
  watch: {
    page(newPage) {
      let { list = [], _list = [] } = this.data;
      let num = newPage * PAGE_SIZE;
      if(!num) return;
      const index = _list.findIndex(i => i?.list?.some(a => a.index == num));
      console.log("newPage", newPage, index, _list);
      if(index == -1) {
        list = [..._list];
      } else {
        const item_x = _list[index].list.findIndex(a => a.index == num);
        list = JSON.parse(JSON.stringify(_list.slice(0, index + 1)));
        console.log("list ====", list, index);
        list[index].list = list[index].list.slice(0, item_x + 1);
      }
      console.log("list ====",list);
      this.setData({
        list,
      });
      setTimeout(() => {
        this.setData({
          isAnimation: false
        })
      }, 2000)
    }
  },
  scrollTop() {
    const { list } = this.data;
    const id = list?.[0]?.datetime;
    this.setData({
      intoView: `A${id}`
    })
  },
  scrolltolower() { // 滚动到底部
    const { maxPage, page } = this.data;
    console.log("滚动到底部", maxPage, page);
    setTimeout(() => {  // 测试上拉加载状态
      this.setData({
        page: page < maxPage ? page + 1 : page,
      })
    }, 1000)
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.scrollTop();
    this.setData({
      isAnimation: false
    })
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
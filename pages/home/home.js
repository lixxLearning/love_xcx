import { _cloud } from "../../utils/http";
import { load, save } from "../../utils/storage";
import { moment_time, format2 } from "../../utils/time";

// pages/home/home.js
const app = getApp();
let bulletChatList = [];
let id = 0;
let cycle = null; //计时器
let topArray = []; //用来做随机top值
let usedTop = [];
// 这是当前list中的索引
let originIndex = 0;
// 这是当前swiper中的索引
let displayIndex = 0;
app.Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: true,
    show_barrage: true,
    activeKey: 0,
    bulletChatData: [],
    bless_list: [],
    originList: [],
    displaySwiperList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.$info("音乐可以点击右上角唱片图标关闭，另外右下角可选择开启弹幕模式（注意，开启弹幕比较吃性能）！", () => {
      this.$loading(3000);
    });
    const isPlay = load("isPlay");
    const show_barrage = load("show_barrage");
    this.setData({
      isPlay,
      show_barrage
    })
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
    this.initBlessList();
  },
  showBarrage() {
    const query = wx.createSelectorQuery();
    query.select(`#main`)
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const {
          height = 0
        } = res[0] || {};
        if (height) {
          // 50是定死的弹幕高度42 + 额外弹幕预留间隙8，懒得再通过createSelectorQuery获取了
          let num = Math.floor(height / 50) - 1;
          while (num >= 0) {
            topArray.unshift(num * 50 || 0);
            num--;
          }
          this.initBarrage();
        }
      })
  },
  // 小程序swiper会一次性渲染全部节点,开销太大，所以这里做个性能优化，每次只固定展示三个swiper-item
  swiperChange(event) { 
    const { current } = event.detail;
      // const originListLength = (this.bless_data.home_swiper || []).length; // 源数据长度
      // // =============向上==========
      // if (displayIndex - current == 2 || displayIndex - current == -1) {
      //   originIndex =
      //     originIndex + 1 == originListLength ? 0 : originIndex + 1;
      //   displayIndex = displayIndex + 1 == 3 ? 0 : displayIndex + 1;
      //   this.initSwiperData(originIndex);
      // }
      // // ======如果两者的差为-2或者1则是向下滑动============
      // else if (displayIndex - current == -2 || displayIndex - current == 1) {
      //   originIndex = originIndex - 1 == -1 ? originListLength - 1 : originIndex - 1;
      //   displayIndex = displayIndex - 1 == -1 ? 2 : displayIndex - 1;
      //   this.initSwiperData(originIndex);
      // }
    this.setData({
      activeKey: current
    })
  },
  offBarrage() {
    const show_barrage = !this.data.show_barrage;
    if(show_barrage) {
      show_barrage && this.showBarrage();
    } else {
      this.clearBarrage();
    }
    save("show_barrage", show_barrage);
    this.setData({
      show_barrage
    })
  },
  clearBarrage() {
    clearInterval(cycle);
    id = 0;
    bulletChatList = [];
    this.setData({
      bulletChatData: []
    })
  },
  initBlessList() {
    // 已经获取数据则去渲染弹幕
    // if(this?.bless_data?.bless_list?.length && this.data.show_barrage) {
    //   this.showBarrage();
    //   return;
    // }
    // TODO
    _cloud("getData", {}, this).then(res => {
      const data = res?.data?.[0] || {};
      // const data = load("blessData") || {};
      console.log("getData ==", data);
      if(!data._id) {
        this.$error('读取数据失败！');
        return 
      }
      this.inittimeline(data.bless_list);
      this.bless_data = data || {};
      this.userInfo = load("userInfo") || {};
      load("isPlay") && this.playSound(wx.getBackgroundAudioManager());
      // this.initSwiperData();
      load("show_barrage") && this.showBarrage();
      this.setData({
        displaySwiperList: data.home_swiper || [],
        swiperLen: (data.home_swiper || []).length,
      })
    });
  },
  initSwiperData(originIndex2 = originIndex) {
    const originList = this.bless_data.home_swiper || [];
    const originListLength = originList.length; // 源数据长度
    const displayList = []; // 要渲染的swiper数组
    displayList[displayIndex] = originList[originIndex2];
    displayList[displayIndex - 1 == -1 ? 2 : displayIndex - 1] =
      originList[
        originIndex2 - 1 == -1 ? originListLength - 1 : originIndex2 - 1
      ];
    displayList[displayIndex + 1 == 3 ? 0 : displayIndex + 1] =
      originList[
        originIndex2 + 1 == originListLength ? 0 : originIndex2 + 1
      ];
    this.setData({
      displaySwiperList: displayList,
    })
  },
  playMusic() {
    let isPlay = !this.data.isPlay;
    if(isPlay) {
      this.playSound(wx.getBackgroundAudioManager())
    } else {
      wx.getBackgroundAudioManager().pause(); // 暂停
    }
    save("isPlay", isPlay);
    this.setData({
      isPlay
    });
  },
  playSound(player) {
    const { music_data = {} } = this.bless_data || {};
      player.title = music_data.name;
      player.src = music_data.url;
      //循环播放
      player.onEnded(() => {
        this.playSound(wx.getBackgroundAudioManager())
      })
  },
  animationend(e) { 
    // console.log("animationend ==", dataset);
    const { current } = e.detail || {};
    this.setData({
      activeKey: current
    })
  },
  initBarrage() {
    let _this = this;
    cycle = setInterval(function () {
      let arr = _this.bless_data.bless_list;
      if (arr[id] === undefined) {
        id = 0;
      }
      // 2.无限循环弹幕
      let obj = {...arr[id] || {}};
      let num = Math.floor(Math.random() * topArray.length);
      obj.top = topArray[num]; //拿到随机值 Math.ceil向上取整
      // 被使用了，从原数组删掉并添加到已使用的数组里
      usedTop.push(topArray[num]);
      topArray.splice(num, 1);
      bulletChatList.push(obj);
     if(bulletChatList.length > 200) {
        bulletChatList.splice(0, 50);
        _this.setData({
          bulletChatData: bulletChatList
        })
     } else {
      _this.setData({
        [`bulletChatData[${bulletChatList.length}]`]: obj
      })
     }
      id++;
      if (usedTop.length > 5) {
        // 从已使用的数组删掉并添加到原数组里
        topArray.push(usedTop.shift());
      }
    }, 1000)
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.clearBarrage();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

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
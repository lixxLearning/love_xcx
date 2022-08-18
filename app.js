import updateManager from './common/updateManager';
import _Page from './utils/page';
App({
  Page: _Page,
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init();
    }
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
  },
  onShow: function () {
    updateManager();
  },
  //封装watch监听
  //首先获取页面数据
  refContext(ctx) {
    let data = ctx.data;
    let watch = ctx.watch;
    //如果watch是以对象写法传进来，遍历watch拿到每一项属性
    Object.keys(watch).map(i => {
      let watchArr = i.split('.') // 将watch中的属性以'.'切分成数组
      let oldData = data; // 将data赋值给oldData
      let watchFun = watch[i].handler || watch[i]; // 兼容带handler和不带handler的两种写法
      let deep = watch[i].deep; // 若未设置deep,则为undefine
      this.observe(oldData, watchArr, watchFun, deep, ctx); // 监听nowData对象的lastKey
    })
  },
  observe(obj, key, watchFun, deep, ctx) {
    let val = obj[key]
    // 判断deep是true 且 val不能为空 且 typeof val==='object'（数组内数值变化也需要深度监听）
    if (deep && val != null && typeof val === 'object') {
      for (let i in val) {
        this.observe(val, i, watchFun, deep, ctx); // 递归调用监听函数
      }
    }
    let that = this
    Object.defineProperty(obj, key, {
      configurable: true, //属性可配置
      enumerable: true, //可以被枚举
      set: function (value) {
        // 用ctx对象调用,改变函数内this指向,以便this.data访问data内的属性值
        watchFun.call(ctx, value, val); // value是新值，val是旧值
        val = value;
        if (deep) { // 若是深度监听,重新监听该对象，以便监听其属性。
          that.observe(obj, key, watchFun, deep, ctx);
        }
      },
      get: function () {
        return val;
      }
    })
  },
  globalData: {

  }
});
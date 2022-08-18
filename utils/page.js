const systemInfo = wx.getSystemInfoSync();

console.log(' SDKVersion >>' + systemInfo.SDKVersion, systemInfo);

import {
  message
} from './message.js';
import { save } from './storage.js';
import { moment_time, format2, format } from './time.js';

export default function (options = {}) {

  const app = getApp();

  return Page({

    data: typeof options.data === 'function' ? function () {
      let data = options.data();
      return {
        ...data,
      }
    } : {
        ...options.data,
      },
    ...options,
      ...message,
      onShareTimeline: function() {
        return {
          title: '刘宝专属小程序',
          query: 'redirect=/pages/index/index',
        }
      },
      onShareAppMessage() {
        return {
          title: '刘宝专属小程序',
          path: '/pages/index/index',
        }
      },
    onLoad: function (query) {
      var app = getApp();
      console.log('app ===>', app);
      this.setData({
        _route: this.route,
      })

      if (query && query.name) {
        this.setData({
          '_title.title': decodeURIComponent(query.name)
        });
      }

      if (options.onLoad) {
        options.onLoad.call(this, query);
      }

      if(query.redirect) {
        wx.reLaunch({
          url: query.redirect,
        })
      }
    },

    onShow: function (arg) {

      if (options.onShow) {
        options.onShow.call(this, arg);
      }
    },
    inittimeline(list = []) { // 初始化足迹的时间轴数据并写入缓存
      this.$loading();
      const newList = list.sort((a, b) => new Date(b.createTime || '').getTime() - new Date(a.createTime || '').getTime());
      console.log("inittimeline ==", newList);
      const obj = {}; // 日期集合
      let index = 0;
      let item_x = 0;
      let arr = [];
      newList.map(i => {
        const createDate = format(i.createTime);
        if(!obj[createDate]) {
          index += 1;
          obj[createDate] = index;
          arr[obj[createDate] - 1] = {date: moment_time(createDate), datetime: new Date(createDate).getTime(), list: []}
        }
        item_x += 1;
        arr[obj[createDate] - 1].list.push({
          id: i.id,
          nickName: i.nickName,
          avatarUrl: i.avatarUrl,
          time: format2(i.createTime),
          index: item_x
        })
      });
      this.$loading_close();
      save("time_line", arr);
      save("total", list.length);
    },
    $href({
      currentTarget: {
        dataset
      }
    }) {

      if (dataset.disabled) {
        return;
      }
      if (dataset.page && dataset.page !== '/' + this.route) {
        let type = dataset.type || 'navigateTo';
        if (!wx[type]) {
          throw new Error('不支持跳转类型：' + type + ' 支持的跳转类型包括：reLaunch, redirectTo, navigateTo, 默认是 navigateTo 具体请参看考小程序文档');
          return;
        }
        wx[type]({
          url: dataset.page
        })
      }
    },

    $open: e => {
      console.log(e.currentTarget.dataset.module, e.currentTarget.dataset.params);
      wx.open(e.currentTarget.dataset.module, e.currentTarget.dataset.params);
    },

    $back: function () {
      wx.navigateBack({
        delta: 1
      });
    },

    $tel: function (e) {
      let tel = e.currentTarget.dataset.tel;
      if (tel) {
        wx.makePhoneCall({
          phoneNumber: tel,
        });
      }
    }

  });
}
import {
  save,
  load,
  clearStorage
} from '../utils/storage';

// 获取当前小程序版本
let version = wx.getAccountInfoSync() ? wx.getAccountInfoSync().miniProgram.envVersion : 'default';
console.log('version', version, wx, wx.getAccountInfoSync());
save('version', version);

const dev = 'http://192.168.2.122:8080/xxx/'; // 后端地址
const uat = 'https://uat.tangusoft.com/xxx/'; // 线上地址
const prd = 'https://uat.tangusoft.com/xxx/'; // 正式地址
const urlObj = {
  'develop': uat, // 开发版
  'trial': uat, // 体验版
  'release': prd, // 正式版
  'default': uat
}
const baseURL = urlObj[version || 'default'];

let requestTimes = 0;
var header = {
  'content-type': 'application/json',
  'Authorization': 'wxtoken ' + load("userInfo")?.token
};

export const setToken = (token) => {
  if (token) {
    header.Authorization = 'wxtoken ' + token;
  } else {
    delete header.Authorization;
  }
}

export const _cloud = (name = '', data = {}, context) => {
  context && context.$loading();
  if (!name) {
    context && context.$error('请指定集合名称!');
    return;
  }
  return new Promise((reslove, reject) => {
    requestTimes++;
    wx.cloud.callFunction({
      name,
      data,
      success: function (res) {
        console.log("res ===", res);
        const data = res?.result;
        if (!data) {
          context && context.$error('读取数据失败！');
          reject();
          return
        }
        reslove(data || {});
        return;
      },
      fail: function (err) {
        console.error(err);
        reject(err);
      },
      complete: () => {
        requestTimes--;
        if (requestTimes === 0) {
          context && context.$loading_close();
        }
      }
    })
  })
}

export const ajax = (url, data = {}, method = 'POST') => {
  wx.showLoading({
    title: "加载中...",
    mask: true,
  })
  return new Promise((reslove, reject) => {
    requestTimes++;
    wx.request({
      url: baseURL + url,
      data,
      header,
      method,
      success: (res) => {
        console.log("method==", baseURL + url, res);
        const {
          status,
          path,
          error
        } = res?.data?.data || {};
        const {
          errorMsg,
          debug,
          error: error2,
          toast,
          message,
          feedbackMsg
        } = res?.data || {};
        if (errorMsg || debug || error2) {
          pageTip(errorMsg || debug || error2, 'error');
          reject(res);
          return;
        }
        if (error && status) {
          pageTip(`接口(${status})：${path} ${error}`, 'error');
          reject(res);
          if (status === 401) {
            clearStorage();
            wx.reLaunch({
              url: '/pages/index/index',
            })
          }
          return;
        }
        if (toast || message) {
          setTimeout(() => {
            pageTip(toast || message, 'toast');
          }, 500)
        }
        feedbackMsg && pageTip(feedbackMsg, 'success');
        reslove({
          data: res?.data?.data,
          body: res?.data,
          res
        });
      },
      fail: (err) => {
        console.log("method==", baseURL + url, err);
        pageTip(err?.data?.errorMsg || '网络波动，请重试', 'error');
        reject(err);
      },
      complete: () => {
        requestTimes--;
        if (requestTimes === 0) {
          wx.hideLoading();
        }
      }
    })
  })
}

const pageTip = (msg, type) => {
  let pages = getCurrentPages();
  if (pages.length) {
    pages[pages.length - 1]['$' + type]?.(msg);
  }
}
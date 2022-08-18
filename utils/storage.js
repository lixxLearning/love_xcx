
var cache = {};

export const save = (key, value) => {
  console.log("save===", key, value);
  cache[key] = value;
  if (value === undefined || value === null) {
    wx.removeStorageSync(key);
  } else {
    wx.setStorageSync(key,
    JSON.stringify(value))
  }
}

export const _delete = (key) => {
  if (cache[key]) {
    wx.setStorageSync(key);
  }
}

export const load = (key) => {
  // console.log('cache laod 1>')
  if (!(key in cache)) {
    // console.log('cache laod 2>')
    let data = wx.getStorageSync(key);
    console.log('cache laod 3>', cache, data)
        data = data;
        if (data === null || data === undefined || data === '') {
          cache[key] = undefined;
        } else {
          cache[key] = JSON.parse(data);
        }
        return cache[key];
  } else {
    return cache[key];
  }
}

export const clearStorage = () => {
  wx.clearStorageSync();
  cache = {};
}


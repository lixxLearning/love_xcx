export default () => {
  if (!wx.canIUse('getUpdateManager')) {  //判断新版本是否兼容小程序更新机制API的使用
    wx.showModal({
      title: '温馨提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
    return;
  }

  const updateManager = wx.getUpdateManager();  // 
  if(!updateManager) return;
  updateManager.onCheckForUpdate(function (res) { // 检测版本更新
    // 请求完新版本信息的回调
    console.log('版本信息', res);
  });

  updateManager.onUpdateReady(function () {
    wx.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success(res) {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate();
        }
      },
    });
  });

  updateManager.onUpdateFailed(function () {
    // 新版本下载失败
  });
};

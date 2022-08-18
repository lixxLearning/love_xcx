function $info(msg, callback) {
  this.$msg_callback = callback;
  const _msg = filterMsg(msg);
  this.setData({
    $icon: 'cuIcon-infofill',
    $iconColor: 'text-blue',
    $msg: _msg,
    $msg_show: true
  })
}

function $error(msg, callback) {
  this.$msg_callback = callback;
  const _msg = filterMsg(msg);
  this.setData({
    $icon: 'cuIcon-roundclosefill',
    $iconColor: 'text-red',
    $msg: _msg,
    $msg_show: true
  })
}

function $success(msg, callback) {
  this.$msg_callback = callback;
  const _msg = filterMsg(msg);
  this.setData({
    $icon: 'cuIcon-roundcheckfill',
    $iconColor: 'text-green',
    $msg: _msg,
    $msg_show: true
  })
}

function $loading(delay_close) {
  this.setData({
    $load_show: true
  });
  if(!delay_close) return;
  setTimeout(() => {
    this.setData({
      $load_show: false
    });
  }, delay_close)
}

function $loading_close() {
  this.setData({
    $load_show: false
  })
}

function $msg_close() {
  this.$msg_callback && this.$msg_callback();
  this.setData({
    $msg_show: false
  })
}

function filterMsg(msg, defaultMsg = '信息错误！') {
  const _msg = typeof msg === 'string' ? msg : typeof msg === 'object' ? JSON.stringify(msg) : defaultMsg;
  return _msg;
}

export const message = {
  $info,
  $success,
  $error,
  $loading,
  $loading_close,
  $msg_close,
  $toast: (msg, options = {}) => {
    wx.showToast({
      title: msg,
      ...options
    })
  }
}
/**
 * 
 * @param { post } url  文件地址
 * @param {*} type base64图片类型
 */
export function base64({
  url,
  type = 'png'
}, callback) {
  wx.getFileSystemManager().readFile({
    filePath: url, //选择图片返回的相对路径
    encoding: 'base64', //编码格式
    success: res => {
      callback('data:image/' + type.toLocaleLowerCase() + ';base64,' + res.data)
    },
    fail: err => {
      throw Error(JSON.stringify(err))
    }
  })
}

// 手机号验证
export function vertifyPhone(phone, context) {
  const reg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
  if (!phone) {
    context && context.$error("请输入手机号！");
    return false;
  }
  if (!reg.test(phone)) {
    context && context.$error("请输入正确手机号！");
    return false;
  }
  return true;
}
export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

/**
 * 格式化精确n位小数位数的数字
 * @param  {Number} num           需要格式化的数字
 * @param  {Number} decimalDigits 10的幂次
 * @return {Number}               格式化后的数字
 */
export const formatNum = (num, decimalDigits = 3) => {
  const isLegalType = (typeof num === 'number') || (typeof num === 'string'); // 类型是否合法
  if (!num || !isLegalType) return 0;
  const multiple = 10 ** decimalDigits;
  const originNum = Number(num) || 0;
  const finalNum = Math.round(originNum * multiple) / multiple;
  return Number(finalNum);
};

/**
 ** 加法函数，用来得到精确的加法结果
 ** 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
 ** 调用：accAdd(arg1,arg2)
 ** 返回值：arg1加上arg2的精确结果
 **/
export function accAdd(arg1, arg2, decimalDigits) {
  var r1, r2, m, c;
  var text, arr;
  r1 = (arr = (text = arg1 + '').split('.'))[1] ? arr[1].length : 0;
  r2 = (arr = (text = arg2 + '').split('.'))[1] ? arr[1].length : 0;

  c = Math.abs(r1 - r2);
  m = Math.pow(10, Math.max(r1, r2));
  if (c > 0) {
    var cm = Math.pow(10, c);
    if (r1 > r2) {
      arg1 = Number(arg1.toString().replace(".", ""));
      arg2 = Number(arg2.toString().replace(".", "")) * cm;
    } else {
      arg1 = Number(arg1.toString().replace(".", "")) * cm;
      arg2 = Number(arg2.toString().replace(".", ""));
    }
  } else {
    arg1 = Number(arg1.toString().replace(".", ""));
    arg2 = Number(arg2.toString().replace(".", ""));
  }
  return formatNum((arg1 + arg2) / m, decimalDigits);
}

/**
 ** 减法函数，用来得到精确的减法结果
 ** 说明：javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。这个函数返回较为精确的减法结果。
 ** 调用：accSub(arg1,arg2)
 ** 返回值：arg1加上arg2的精确结果
 **/
export function accSub(arg1, arg2, decimalDigits) {
  var r1, r2, m, n;

  var text, arr;
  r1 = (arr = (text = arg1 + '').split('.'))[1] ? arr[1].length : 0;
  r2 = (arr = (text = arg2 + '').split('.'))[1] ? arr[1].length : 0;

  m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
  n = (r1 >= r2) ? r1 : r2;
  return formatNum(((arg1 * m - arg2 * m) / m).toFixed(n), decimalDigits);
}

/**
 ** 乘法函数，用来得到精确的乘法结果
 ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
 ** 调用：accMul(arg1,arg2)
 ** 返回值：arg1乘以 arg2的精确结果
 **/
export function accMul(arg1, arg2, decimalDigits) {
  var m = 0;

  var text, arr, r1, r2;
  m += (arr = (text = arg1 + '').split('.'))[1] ? arr[1].length : 0;
  m += (arr = (text = arg2 + '').split('.'))[1] ? arr[1].length : 0;

  r1 = Number(arg1.toString().replace(".", ""));
  r2 = Number(arg2.toString().replace(".", ""));

  return formatNum(r1 * r2 / Math.pow(10, m), decimalDigits);
}

/** 
 ** 除法函数，用来得到精确的除法结果
 ** 说明：javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。这个函数返回较为精确的除法结果。
 ** 调用：accDiv(arg1,arg2)
 ** 返回值：arg1除以arg2的精确结果
 **/
export function accDiv(arg1, arg2, decimalDigits) {
  var t1 = 0,
    t2 = 0,
    r1, r2;

  var text, arr;
  t1 = (arr = (text = arg1 + '').split('.'))[1] ? arr[1].length : 0;
  t2 = (arr = (text = arg2 + '').split('.'))[1] ? arr[1].length : 0;

  r1 = Number(arg1.toString().replace(".", ""));
  r2 = Number(arg2.toString().replace(".", ""));
  return formatNum((r1 / r2) * Math.pow(10, t2 - t1), decimalDigits);
}

/** 
 *  四舍五入保留小数位
 *
 */
export function round(num, len) {
  if (len === 0) {
    return Math.round(num);
  }
  var arr = (num + '').split('.');
  if (!arr[1] || arr[1].length <= len) {
    return num;
  }

  var a = Number(arr[0] + arr[1].slice(0, len)),
    b;
  if (arr[1].slice(len, len + 1) >= 5 && num > 0) {
    a += 1;
  } else if (arr[1].slice(len, len + 1) > 5 && num < 0) {
    a -= 1;
  }
  a = a + '';

  return Number(a.substring(0, a.length - len) + '.' + a.substring(a.length - len));

}
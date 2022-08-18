
import _moment from '../common/zmoment/moment.js';
import '../common/zmoment/locale/zh-cn';

export const moment = _moment;

/**
 * 此刻年月日
 */
export const date = () => {
    return moment(Date.now()).format('YYYY-MM-DD');
}

/**
 * 此刻 年月日 时分
 */
export const now = () => {
    return moment(Date.now()).format('YYYY-MM-DD HH:mm');
}

/**
 * 此刻 年月日 时分秒
 */
export const now0 = () => {
  return moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 今天凌晨零时 年月日 时分
 */
export const time0 = () => {
    return moment(Date.now()).format('YYYY-MM-DD')+' 00:00';
}

/**
 * 今天23:59 年月日 时分
 */
export const time2 = () => {
    return moment(Date.now()).format('YYYY-MM-DD')+' 23:59';
}

/**
 * 格式化为 YYYY-MM-DD
 * @param {*} date 
 */
export const format = (date, format_str = 'YYYY-MM-DD') => {
    return moment(date).format(format_str);
}

/**
 * 格式化为 YYYY-MM-DD HH:mm
 * @param {} date 
 */
export const format1 = (date) => {
    return moment(date).format('YYYY-MM-DD HH:mm');
}

/**
 * 格式化为 HH:mm
 * @param {} date 
 */
export const format2 = (date) => {
  return moment(date).format('HH:mm');
}

export const date_time = () => {
  return moment(date() + ' 00:00').valueOf();
}

export const moment_time = (time) => { // 时间格式过滤
  if (!time) return;
  moment.locale("zh", {
    weekdays: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
      calendar: {
          lastDay: "[昨天]",
          lastWeek: "MM-DD",
          nextDay: "[明天]",
          nextWeek: "MM-DD",
          sameDay: "[今天]",
          sameElse: function (now) {
              if (moment().year() === new Date(time).getFullYear()) {
                  return "MM-DD";
              } else {
                  return "YYYY-MM-DD";
              }
          }
      }
  });
  return moment(time).calendar();
}

export const week_time = (time) => {
  if (!time) return;
  const week = "周" + "日一二三四五六".charAt(moment(time).weekday());
  return week;
}



import { date, date_time, format, moment } from "../utils/time";

const app = getApp();
Component({
  /**
   * 组件的一些选项
   */
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  /**
   * 组件的对外属性
   */
  properties: {
    visbile: {  // 是否可见
      type: Boolean,
      value: 'true'
    },
    maxDate: {  // 指定今天之后的多少天内皆可选择
      type: Number,
      value: 7
    },
    months: { // 需要渲染几个月的日期数据
      type: Number,
      value: 2
    },
    detail: {
      type: Object,
      value: {}
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _maxDate: {},
    today: {
      date: date(),
      time: date_time()
    },
    selectDate: '',
    weekList: [{
        label: '日',
        value: 0
      },
      {
        label: '一',
        value: 1
      },
      {
        label: '二',
        value: 2
      },
      {
        label: '三',
        value: 3
      },
      {
        label: '四',
        value: 4
      },
      {
        label: '五',
        value: 5
      },
      {
        label: '六',
        value: 6
      },
    ],
    dateList: [],
    statusObj: {
      0: {
        name: '不可预约',
        color: 'text-red'
      },
      2: {
        name: '部分预约',
        color: 'text-yellow'
      },
      1: {
        name: '可预约',
        color: 'text-green'
      },
    }
  },
  ready: function() {
    this.init();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    init() {
      console.log("this ===", this.properties);
      const dateList = this.getMonthDates(this.properties.months);
    const maxDate = moment().add(this.properties.maxDate, 'days').format("YYYY-MM-DD");
    const maxTime = moment(`${maxDate} 00:00`).valueOf();
    console.log("dateList ===>", dateList, this.properties, maxDate + ' 00:00');
    setTimeout(() => {
      console.log("11113333", this.data, new Date(maxDate + ' 00:00').getTime());
    }, 2000)
    this.setData({
      dateList,
      _maxDate: {
        date: maxDate,
        time: maxTime
      }
    });
    },
    close() {
      this.triggerEvent("close", this);
    },
    clickToday() {
      this.setData({
        selectDate: this.data.today.date
      })
      this.triggerEvent("dateclick", this.data.today);
    },
    dateClick({ currentTarget: { dataset } }) {
      const { item } = dataset || {};
      // 今天之前和指定天数之后的不可选择
      if(item.dateTime < this.data.today.time || this.data._maxDate.time <= item.dateTime) return;
      this.setData({
        selectDate: item.date
      })
      this.triggerEvent("dateclick", item);
    },
    getMonthDates(month_num = 2) {  // 指定返回多少个月的日期
      const dateList = [];
      for (let index = 0; index < month_num; index++) {
        dateList.push({
          date: moment().add(index, 'M').format('YYYY年MM月'),
          dateList: this.getDates(undefined, moment().add(index, 'M').month() + 1)
        })
      }
      return dateList;
    },
    getDates(year = new Date().getFullYear(), month = new Date().getMonth() + 1) { // 返回所有日期
      console.log("getDates ====", year, month);
      const day = new Date(year, month, 0).getDate(); // 天数
      let now = new Date(year, month, 0); 
      let current_month_num = day;
      let current_month = [];
      for (let i = 1; i <= current_month_num; i++) {
        const dateTime = now.setDate(i);
        const dateObj = {
          label: moment(dateTime).format('DD'),  // 展示的数据
          date: format(dateTime),  // 格式化后的日期
          dateTime, // 时间戳
          week: moment(dateTime).day()  // 当前星期几
        }
        current_month.push(dateObj);
      }
      return current_month;
    }
  }
})
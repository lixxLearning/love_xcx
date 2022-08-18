import { PAGE_SIZE } from "../../utils/constants";
import { _cloud } from "../../utils/http";
import { load } from "../../utils/storage";
import { now0 } from "../../utils/time";
import { uuid } from "../../utils/util";

// pages/bless/leave_message/leave_message.js
const app = getApp();
app.Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,
    isRefresh: false,
    maxPage: 1,
    page: 1,
    pageSize: PAGE_SIZE,
    intoView: "",
    blessMsg: "",
    searchText: "",
    isAnimation: true,
    showBless: false,
    blessDefault: [],
    _blessList: [], // 数据源
    blessList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.refContext(this);
    this.initData();
    // let list = [];
    // for (let i = 0; i < 50; i++) {
    //   list.push({
    //     key: "A" + uuid(),
    //     nickName: '知友',
    //     date: '2022-07-21 17:14:59',
    //     avatarUrl: "https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIUp6yo3cLL9eLKYFeZzOhqSXibMYXCcdTic1HhrHt331MriaD7fxmcK735wrhBBI7edJyC7kq5LTxOw/132",
    //     blessMsg: "今朝已定百年好，愿祝新人共白首!今朝已定百年好，愿祝新人共白首!今朝已定百年好，愿祝新人共白首!"
    //   }, )
    // }
    
    // this.setData({
    //   _blessList: list,
    //   maxPage: Math.ceil(list.length / default_pagesize)
    // });
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
    this.setData({
      isShow: load('version') == 'release',
      isAnimation: true
    });
  },
  watch: {
    _blessList(val) {
      // this.$loading();
      const { searchText, page, pageSize } = this.data;
      const list = searchText ? val.filter(i => ['nickName', 'blessMsg', 'createTime'].some(v => (i[v] || '').includes(searchText || ''))) : val;
      const blessList = list.slice(0, page * pageSize);
      console.log("blessList ==", searchText, list, blessList, page, pageSize);
      this.setData({
        maxPage: Math.ceil(list.length / this.default_pagesize),
        blessList
      }, () => {
        // this.$loading_close();
      })
    },
    blessList() {
      setTimeout(() => {
        this.setData({
          isAnimation: false
        })
      }, 1000)
    },
    isRefresh(val) {
      if(val) {
        this.initData();
      }
    }
  },
  initData() {
    // TODO
    _cloud("getData", {}, this).then(res => {
      const data = res?.data?.[0] || {};
      console.log("初始化数据");
      // const data = load("blessData") || {};
      if(!data._id) {
        this.$error('读取数据失败！');
        return 
      }
      this.inittimeline(data.bless_list);
      this.bless_data = data || {};
      this.userInfo = load("userInfo") || {};
      this.default_pagesize = PAGE_SIZE;
      this.setData({
        isRefresh: false,
        openid: this.userInfo.openid,
        maxPage: Math.ceil(data.bless_list.length / this.default_pagesize),
        page: 1,
        pageSize: this.default_pagesize,
        intoView: "",
        blessMsg: "",
        searchText: "",
        isAnimation: true,
        showBless: false,
        blessDefault: data.bless_template || [],
        blessList: (data.bless_list|| []).slice(0, this.default_pagesize)
      }, () => {
        // 这种写法防止数据监听获取不到同时set的其他变量，暂存this变量里也可以同步获取
        this.setData({
          _blessList: (data.bless_list || []).map(i => {
            return {...i, isLike: i?.likeList?.includes(this.userInfo.openid)}
          }), // 数据源
        })
      })
    });
  },
  refresherrefresh() {  // 下拉被触发
    console.log("下拉被触发 ==");
    this.setData({
      isRefresh: true
    })
  },
  scrolltolower() { // 滚动到底部
    console.log("滚动到底部");
    const { _blessList, page, maxPage } = this.data;
    setTimeout(() => {  // 测试上拉加载状态
      this.setData({
        page: page < maxPage ? page + 1 : page,
      }, () => {
        this.setData({
          _blessList
        })
      })
    }, 1000)
  },
  filterList(list = this.data._blessList) {
    this.setData({
      isAnimation: true,
      blessList: list.filter(i => ['nickName', 'blessMsg', 'date'].some(v => (i[v] || '').includes(this.data.searchText || '')))
    })
  },
  toSearch(e) {
    this.setData({
      page: 1,
      isAnimation: true,
      searchText: e.detail.value
    }, () => {  
      this.setData({
        _blessList: this.data._blessList,
      })
    })
  },
  scrollTop() {
    const { blessList } = this.data;
    this.setData({
      intoView: `${blessList[0].id}`
    })
  },
  blessChange({
    currentTarget: {
      dataset
    }
  }) {
    const { msg } = dataset || {};
    this.setData({
      blessMsg: msg
    })
  },
  textareaAInput(e) {
    console.log("textareaAInput", e);
    this.setData({
      blessMsg: e.detail.value
    })
  },
  sendBless() {
    const { _blessList, blessMsg } = this.data;
    const { nickName, avatarUrl } = this.userInfo || {};
    const record = {
      id: "A" + uuid(),
      nickName,
      createTime: now0(),
      avatarUrl,
      likesNum: 0,
      likeList: [],
      blessMsg
    };
    const params = {
      record
    };
    _cloud("addBless", params, this).then(res => {
      console.log("res");
      this.closeBless();
      _blessList.unshift(record);
      setTimeout(() => {
        this.setData({
          isAnimation: false,
          _blessList
        }, () => {
          this.scrollTop();
        })
      })
    })
  },
  tolove({
    currentTarget: {
      dataset
    }
  }) {
    const {
      key
    } = dataset || {};
    const {
      _blessList,
    } = this.data;
    const { openid } = this.userInfo;
    const newList = _blessList.map((v, x) => {
      if(key == v.id && !v.likeList.includes(openid)) {
        v.likeList.push(openid);
        v = {
          ...v,
          isLike: true,
          likesNum: (v.likesNum || 0) + 1
        }
        const params = {
          openid,
          id: v.id
        };
        // TODO
        _cloud("update_like", params).then(res => {
          wx.showToast({
            title: '点赞成功',
            duration: 1000,
          })
        })
      }
      return v;
    });
    console.log("tolove", newList);
    this.setData({
      _blessList: newList
    })
  },
  onShare() {

  },
  toBless() {
    this.setData({
      showBless: true
    })
  },
  closeBless() {
    this.setData({
      showBless: false,
      blessMsg: ""
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.scrollTop();
    this.setData({
      isAnimation: false
    })
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
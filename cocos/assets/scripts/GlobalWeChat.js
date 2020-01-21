window.WeChat = {};

// 微信登录注册调用
WeChat.onRegisterUser = _userinfo => {
    // 调用云函数注册
    wx.cloud.callFunction({
        name: 'login',
        data: {
            userinfo: _userinfo
        },
        success: res => {
            console.log('登录成功回调', res)
            G.userInfo = res.result.data.length > 0 ? res.result.data[0].userinfo : res.result.data.userinfo;
            G.userInfo['openId'] = res.result.data.length > 0 ? res.result.data[0].openid : res.result.data.openid;

            // 跳转场景
            cc.director.loadScene("game");
        },
        fail: err => {
            console.error(err);
        }
    })
};

// 更新用户分数
WeChat.onUpdateScore = score => {
    // 调用云函数更新分数
    wx.cloud.callFunction({
        name: 'score',
        data: {
            _type: 'update',
            score,
            userinfo: G.userInfo
        },
        success: res => {
            console.log('更新分数成功回调', res);
        },
        fail: err => {
            console.error(err);
        }
    })
}


// 获取用户分数
WeChat.onSearchScore = callback => {
    // 调用云函数更新分数
    wx.cloud.callFunction({
        name: 'score',
        data: {
            _type: 'search',
            userinfo: G.userInfo
        },
        success: res => {
            console.log('获取用户分数成功回调', res);
            callback && callback(res.result);
        },
        fail: err => {
            console.error(err);
            callback && callback(0);
        }
    })
}
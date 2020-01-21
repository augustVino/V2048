"use strict";
cc._RF.push(module, '18822anBQVHYaJ1EgFg/Gll', 'GlobalWeChat');
// scripts/GlobalWeChat.js

'use strict';

window.WeChat = {};

// 微信登录注册调用
WeChat.onRegisterUser = function (_userinfo) {
    // 调用云函数注册
    wx.cloud.callFunction({
        name: 'login',
        data: {
            userinfo: _userinfo
        },
        success: function success(res) {
            console.log('登录成功回调', res);
            G.userInfo = res.result.data.length > 0 ? res.result.data[0].userinfo : res.result.data.userinfo;
            G.userInfo['openId'] = res.result.data.length > 0 ? res.result.data[0].openid : res.result.data.openid;

            // 跳转场景
            cc.director.loadScene("game");
        },
        fail: function fail(err) {
            console.error(err);
        }
    });
};

// 更新用户分数
WeChat.onUpdateScore = function (score) {
    // 调用云函数更新分数
    wx.cloud.callFunction({
        name: 'score',
        data: {
            _type: 'update',
            score: score,
            userinfo: G.userInfo
        },
        success: function success(res) {
            console.log('更新分数成功回调', res);
        },
        fail: function fail(err) {
            console.error(err);
        }
    });
};

// 获取用户分数
WeChat.onSearchScore = function (callback) {
    // 调用云函数更新分数
    wx.cloud.callFunction({
        name: 'score',
        data: {
            _type: 'search',
            userinfo: G.userInfo
        },
        success: function success(res) {
            console.log('获取用户分数成功回调', res);
            callback && callback(res.result);
        },
        fail: function fail(err) {
            console.error(err);
            callback && callback(0);
        }
    });
};

cc._RF.pop();
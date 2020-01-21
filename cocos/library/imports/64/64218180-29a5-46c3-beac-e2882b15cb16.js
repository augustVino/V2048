"use strict";
cc._RF.push(module, '64218GAKaVGw76s4ogrFcsW', 'login');
// scripts/login.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        BGSprite: {
            default: null,
            type: cc.Sprite,
            serialzable: true
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        var _this = this;

        // 通过获取云储存的图片来渲染背景
        var url = 'https://7265-release-1zxx1-1301133378.tcb.qcloud.la/gamePicture/Login.png?sign=06b408dee5710fadee566d35385061b3&t=1579426938';
        cc.loader.load({
            url: url,
            type: 'jpg'
        }, function (err, texture) {
            var frame = new cc.SpriteFrame(texture);
            if (err) {
                console.log('登录背景图片', err);
            };
            _this.BGSprite.getComponent(cc.Sprite).spriteFrame = frame;
        });

        wx.login({
            success: function success(res) {
                if (res.code) {
                    console.log('登录成功，获取到code', res.code);
                }
            }
        });

        // 此处需要判断基础库版本，低版本不支持createUserInfoButton方法
        var button = wx.createUserInfoButton({
            type: 'text',
            text: "开始游戏",
            style: {
                left: wx.getSystemInfoSync().screenWidth / 2 - 60,
                top: wx.getSystemInfoSync().screenHeight / 2 - 60,
                width: 120,
                height: 40,
                lineHeight: 40,
                backgroundColor: '#fb94a9',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 20
            }
        });

        button.show();
        console.log('button', button);

        button.onTap(function (res) {
            console.log(res);
            if (res.errMsg === "getUserInfo:ok") {
                console.log("已经授权");
                // 注册用户信息
                WeChat.onRegisterUser(res.userInfo);

                button.destroy();
            } else {
                console.log("没有授权");
            }
        });
    },
    start: function start() {}
}

// update (dt) {},
);

cc._RF.pop();
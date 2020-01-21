# 微信小游戏 - 2048

注意： 本项目并非本人原创，只是在tx课堂学习微信小游戏开发时跟着老师写的demo

本项目分为两部分，一部分是 CocosCreator 搭建的（cocos文件夹），另外一部分（2048）是使用微信开发者工具创建的**云开发**小游戏项目。

## 使用方式

1. 代码 clone 到本地后
2. 使用 CocosCreator 导入项目（cocos文件夹）
3. 然后构建生成微信小游戏。
4. 把 build 文件夹中生成的 wechatgame 整体复制到微信开发者工具生成的小游戏云开发项目中（替换掉原有的 miniProgram 文件夹）。
5. 把project.config.json文件中的`"miniprogramRoot"`属性设置为: `"wechatgame/"`
6. wechatgame 目录中的 game.js 底部新增云开发初始化方法
```js
// 云函数初始化
wx.cloud.init({
    // 此处填写你的云开发环境id
    env: 'dev'
});


window.boot();
```
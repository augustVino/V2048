// 云函数入口文件
const cloud = require('wx-server-sdk')

// 与小程序端一致，均需调用 init 方法初始化
cloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: cloud.DYNAMIC_CURRENT_ENV
})

// 可在入口函数外缓存 db 对象
const db = cloud.database()

// 数据库查询更新指令对象
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

    // 以 openid-score 作为记录 id
    const docId = `${event.userinfo.openId}-score`

    const _type = event._type;

    let userRecord

    try {
        const querResult = await db.collection('score').doc(docId).get()
        userRecord = querResult.data
    } catch (err) {
        // 用户第一次上传分数
    };

    if(_type === 'update'){

        if (userRecord) {
            // 更新用户分数

            const maxScore = userRecord.scoreList.concat([event.score]).reduce((acc, cur) => cur > acc ? cur : acc)

            const updateResult = await db.collection('score').doc(docId).update({
                data: {
                    // _.push 指往 scores 数组字段尾部添加一个记录，该操作为原子操作
                    scoreList: _.push(event.score),
                    maxScore,
                    due: new Date()
                }
            })

            if (updateResult.stats.updated === 0) {
                // 没有更新成功，更新数为 0
                return {
                    success: false
                }
            }

            return {
                success: true,
                updated: true
            }

        } else {
            // 创建新的用户记录
            await db.collection('score').add({
                // data 是将要被插入到 score 集合的 JSON 对象
                data: {
                    // 这里指定了 _id，如果不指定，数据库会默认生成一个
                    _id: docId,
                    // 分数历史
                    scoreList: [event.score],
                    due: new Date(),
                    // 缓存最大值
                    maxScore: event.score,
                }
            })

            return {
                success: true,
                created: true,
            }
        }
    }else if(_type === 'search'){
        let userRecord

        try {
            const querResult = await db.collection('score').doc(docId).get()
            userRecord = querResult.data
        } catch (err) {
            // 用户第一次玩儿
        }
        
        // 注意：返回的userRecord可能没有数据（用户第一次玩儿），所以需要在接收出出力
        return userRecord;
    }
}
// 给手机

//随机生成验证码
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
const axios = require('axios');
const qs = require('querystring');

async function sendVerificationCode( mobile, minute=5 ) {
    const host = "https://gyytz.market.alicloudapi.com";
    const path = "/sms/smsSend";
    const appcode = "9d83bdaf1ce74c438e2f2ba9964a9be5"; //实际的appcode

    const headers = {
        "Authorization": "APPCODE " + appcode,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    };
    let code = generateCode();
    const params = {
        mobile: mobile,
        param: `**code**:${code},**minute**:${minute}`,
        smsSignId: "2e65b1bb3d054466b82f0c9d125465e2", // 实际签名ID
        templateId: "7770bb623204495cb0098b75e70a3a60" // 实际模板ID
    };
    try {
        const response = await axios.post(
            host + path,
            qs.stringify(params), // 将对象转换为URL编码的字符串
            { headers }
        );
        console.log(response.data);
        return { status: 200, msg: '发送成功',code } //调用函数返回一个对象
    } catch (error) {
        console.error("请求失败:");
        return { status: 500, msg: '发送失败' } //调用函数返回一个对象
    }
}

module.exports = sendVerificationCode
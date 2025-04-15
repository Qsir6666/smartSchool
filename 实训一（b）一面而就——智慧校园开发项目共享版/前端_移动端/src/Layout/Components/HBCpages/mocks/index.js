import Mock from "mockjs";
var {userdata}=Mock.mock({
    "userdata|23-30":[
        {
            "id|+1":1,
            "name":'@cname',
            "status":'@boolean',
            "zhaopian":'@image(100x100)',
            "action|1-3":false,
            "now":'@now("yyyy-MM-dd")',
            "datatime":'@datetime("yyyy-MM-dd")',
            "content":'@csentence(5,12)',
            "nianji|1": ['2501A', '2501B', '2501C'],
            "xueyuan|1": [
                "人工智能学院",
                "云计算学院",
                "大数据学院",
                "数智传媒学院",
                "鸿蒙生态开发学院",
                "元宇宙学院"
            ]
        }  ]
})

Mock.mock('/hbc/jia','get',()=>{
    return {
        code:200,
        message:'查询用户信息成功',
        data:userdata
    }
})
const reportNames = [
  "学生考勤报表",
  "教师授课计划",
  "实验室使用记录",
  "图书馆借阅统计",
  "校园活动总结",
  "课程成绩分析",
  "校园安全检查",
  "财务收支明细",
  "教学设备维护",
  "学生社团活动记录",
  "学生健康监测报表",
  "校园设施维护记录",
  "教学资源使用统计",
  "学生心理健康报告",
  "校园网络使用情况",
  "教师培训记录",
  "学生实习报告",
  "校园文化建设总结",
  "学生竞赛成果统计",
  "校园环境监测报告",
  "学生就业情况统计",
  "校园安全培训记录",
  "学生社团财务报告",
  "校园活动参与统计",
  "学生奖学金评定报告",
  "教师科研成果统计",
  "校园文化建设活动总结",
  "学生课堂表现评估",
  "校园文化建设成果展示",
  "学生毕业设计统计"
];
const reportMetrics = [
  "出勤率",
  "缺勤次数",
  "平均成绩",
  "最高分",
  "最低分",
  "借阅次数",
  "活动参与人数",
  "活动满意度",
  "设备使用时长",
  "设备故障次数",
  "安全检查次数",
  "安全问题次数",
  "收支总额",
  "收入金额",
  "支出金额",
  "培训时长",
  "培训人数",
  "实习人数",
  "实习时长",
  "竞赛获奖人数",
  "竞赛参与人数",
  "环境监测指标",
  "健康监测指标",
  "心理健康评分",
  "网络使用时长",
  "网络故障次数",
  "奖学金发放金额",
  "奖学金获奖人数",
  "科研成果数量",
  "课堂表现评分",
  "文化建设活动次数",
  "文化建设活动参与人数",
  "毕业设计通过率"
];
var {baodata}=Mock.mock({
    "baodata|14-26":[
       {
        "id|+1":1,
        "main":"@csentence(6,10)",
        "content|1": reportNames,
        "now":"@now('yyyy-MM-dd')",
        "datetime":"@datetime('yyyy-MM-dd')",
        "content2|1": reportMetrics, 
        "content3|1": reportMetrics,
        "status|1-3":false
       }
    ]
})
Mock.mock('/hbc/bao','get',()=>{
    return {code:200,message:'查询用户信息成功',data:baodata}
})
var {qindata}=Mock.mock({
    "qindata|4-6":[{
        "id|+1":1,
        "name":"@cname",
        "stated|1-2":false,
        "now":"@now('yyyy-MM-dd')",
        "datetime":"@datetime('yyyy-MM-dd')",
        "shen|1-3":false,
        "tong|1-3":true
    }]
})
Mock.mock('/hbc/qing','get',()=>{
    return {code:200,message:'查询成功',data:qindata}
})
// 模拟恶意文件检测函数
const scanForMalware = () => {
    // Mock规则：10%概率返回不安全
    return Mock.mock({ 'bool|0.9': true }).bool;
  };
  Mock.mock('/api/upload', 'post', (options) => {
    try {
      const { body } = options;
      const { image } = JSON.parse(body);
      // 校验Base64格式
      if (!image?.startsWith('data:image/jpeg;base64,')) {
        return Mock.mock({
          status: 400,
          message: '非法文件类型:仅支持JPEG图像',
          timestamp: +Mock.Random.date('T')
        });
      }
      console.log(image,'123')
      // 计算文件大小
      const base64Data = image.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      // 检查文件大小 (2MB限制)
      if (buffer.length > 2 * 1024 * 1024) {
        return Mock.mock({
          status: 413,
          message: '文件超过大小限制(最大2MB)',
          timestamp: +Mock.Random.date('T')
        });
      }
      // 模拟安全扫描
      if (!scanForMalware(buffer)) {
        return Mock.mock({
          status: 403,
          message: '检测到潜在安全风险',
          timestamp: +Mock.Random.date('T')
        });
      }
      
      // 成功响应
      return Mock.mock({
        status: 200,
        data: {
          "url": "@image('200x200', '#50B347', '认证图片')",
          "id|+1": 1
        },
        timestamp: +Mock.Random.date('T')
      });
    } catch (error) {
      // 异常处理
      return Mock.mock({
        status: 500,
        message: '服务器内部错误',
        timestamp: +Mock.Random.date('T')
      });
    }
  });
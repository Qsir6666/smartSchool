const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://949408033:NSBkKZbCcAZDHPfq@cluster0.jrpt67d.mongodb.net/smartSchool').then(() => {
  console.log('连接成功');
}).catch(() => {
  console.log('连接失败');
})

// 👇👇👇👇👇👇👇👇👇👇👇👇👇👇
// 登录模块
const loginSchema = new mongoose.Schema({
  username: String,    //账号
  password: String,    //密码

  // 个人实名信息
  name: String,        //用户姓名
  img: String,         //头像
  school: String,      // 学校
  jobposition:String,  //职位 （保安、考勤人员、校长）
  power: { type: Number, default: -1}, //1保安小队长  2中队长 3大队长
  phone:String,        //绑定手机号（手机号登陆）
  loginimg:String      //绑定人脸照片src路径（人脸识别登录）
})
const loginModel = mongoose.model('login', loginSchema, 'login')
// 手机验证码校验模型
const verificationCodeSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5分钟后自动删除文档（基于TTL索引）
  }
})
const VerificationCodeModel = mongoose.model('VerificationCode', verificationCodeSchema)



//👇👇👇👇👇👇👇👇👇👇👇👇👇👇
// 齐文纲
//班级信息列表 
const classSchema = new mongoose.Schema({
    teacherName: String,  //班主任姓名
    class: String, //表示几年级（1~6）
    grade: String, //表示哪个班（1~3）
    phone: String  //教师联系方式
})
const classModel = mongoose.model('class', classSchema, 'class')
// 学生信息列表
const stuedentSchema = new mongoose.Schema({
    name: String,   // 学生姓名 
    classid: { type: mongoose.Types.ObjectId, ref: 'class' }, //绑定班级外键
    attendance: [{
        date: Number,   // 直接存 Date.now()
        cate: { type: String, enum: ['1','2','3','4'] }     //cate=1表示出勤、 2：病假、 3：事假  4、旷课
      }]
})
const studentModel = mongoose.model('student', stuedentSchema)
//  ai消息模型
const chatHistorySchema = new mongoose.Schema({
    content: String,
    isAI: Boolean,
    timestamp: { type: Number, index: true }, // 时间戳索引
    isGreeting: { type: Boolean, default: false } 
  })
const ChatHistoryModel = mongoose.model('ChatHistory', chatHistorySchema)



//👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇
// YZY
// 隐患类型模式
const TypeSchema = new mongoose.Schema({
    text: String,
    value: String,
  })
const TypeModel = mongoose.model('Type', TypeSchema, 'type');
// 上报隐患模式
const HiddenTroubleSchema = new mongoose.Schema({
  // 隐患信息
  detail: String,
  // 照片或视频
  PhotosOrVideos: String,
  // 隐患地点
  place: String,
  // 是否处理
  dispose: {
    type: Boolean,
    default: false
  },
  // 上报时间
  time:{
    type:Date,
  },
  // 隐患状态
  state:{
    type:String,
    enum:['1','2','3','4'],//1待审核，2处理中，3已完成，4我的
    default:1
  },
  // 隐患类型
  type: {
    type: mongoose.Types.ObjectId,
    ref: 'Type' // 引用 Type 模型
  },
  // 提交人信息
  userName: {
    type: mongoose.Types.ObjectId,
    ref: 'login',
  },
});
const HiddenTroubleModel = mongoose.model('HiddenTrouble', HiddenTroubleSchema, 'hidden');


// 👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇
// JXH  数据未导入!!
const Jbaschema = new mongoose.Schema({
    name: String,
    id:Number
}) 
const JbaseModel = mongoose.model('Jbase', Jbaschema)

const Jpatrol = new mongoose.Schema({
    time: String,
    status:{
        type: Boolean,
        default: true
    },
    summary:String,
    imgUrl:{
        type:Array,
        default:[] 
    },
    id:{
        ref: 'Jbase',
        type: mongoose.Schema.Types.ObjectId
    }
})
const JpatrolModel = mongoose.model('Jpatrol', Jpatrol)
//用户 张三 张四等等
// const UserSchema = new mongoose.Schema({
//   username: String,
//   password: String,
//   name: String,
//   img: String,
//   school: String, 
//   power:Number
// })
// const UserModel = mongoose.model('user', UserSchema, 'user')

// 上报的问题
const QuestionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now }, // 建议改名为date并使用Date类型
  status: { type: String, enum: ['normal', 'abnormal'], required: true },
  summary: { type: String, required: true }, 
  // 上报图片
  images: [{ type: String }],    // 存储BASE64图片数据
  img: { type: String },        // 存储图片URL
  // 上报人员
  name: { type: String, required: true },
  school: { type: String, required: true },
  num: {type: String }
})
const QuestionModel = mongoose.model('question', QuestionSchema, 'question')
// 签到保安
const SignSchema = new mongoose.Schema({
  date: { type: String, default: Date.now }, // 改用字符串存储日期（格式：YYYY-MM-DD）
  name: { type: String, required: true },
  signed: { type: Boolean, default: false } // 明确签到状态字段
})
const SignModel = mongoose.model('sign', SignSchema, 'sign')






module.exports = {
    classModel, studentModel, ChatHistoryModel, loginModel, VerificationCodeModel,//QWG
    TypeModel, HiddenTroubleModel,//YZY
    JbaseModel,JpatrolModel,QuestionModel,SignModel //jxh
}
var express = require('express');
var router = express.Router();
const multer = require('multer');
const { JbaseModel, JpatrolModel, QuestionModel, SignModel,loginModel } = require('../db/index')
const cron = require('node-cron');


// 每天北京时间7点执行
cron.schedule('17 22 * * *', async () => {
  console.log('开始');

  // 获得当前北京时间
  const today = new Date().toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
  try {
    // 所有BA的姓名
    // const guards = await loginModel.find({}, 'name');
    const guards = await loginModel.find({ jobposition: '保安' });
    // console.log(guards);
    
    // 批量创建
    const ops = guards.map(guard => ({
      updateOne: {
        filter: { date: today, name: guard.name },
        update: { $setOnInsert: { signed: false } },
        upsert: true
      }
    }));
    await SignModel.bulkWrite(ops); 
  } catch (error) {
    console.error('处理失败:', error);
  }
}, {
  timezone: "Asia/Shanghai" // 时区必须设置！
});







// SignModel  是存储每天的登录信息








// 签到
router.get('/jsignintrue', async (req, res) => {
  let { _id, signed } = req.query
  console.log(_id, signed);
  // 修改数据
  await SignModel.findByIdAndUpdate(_id, { signed: signed === 'true' })

  res.send({
    code: 200,
    data: 'ok'
  })
})


// 签到信息
router.get('/jsignin', async (req, res) => {
  // 获得当前北京时间（格式：2024-03-25）
  const today = new Date().toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
  let data = await SignModel.find()
  res.send({
    code: 200,
    data: data
  })
})

async function zxcvbnm() {
  const today = new Date().toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
  let data = await SignModel.find()
  data.forEach(item => {
    console.log(item)
  })
}
// zxcvbnm()











async function bnm() {
  let op = {}
  op.time = '2022-02-02'
  op.status = true
  op.summary = '正常'
  op.imgUrl = ['https://ts1.tc.mm.bing.net/th/id/R-C.b8dd91dda9505cebf965a01b3101c558?rik=UGjiqSOKUqxH9g&riu=http%3a%2f%2fwww.kmsdba.com%2fdata%2fimages%2fproduct%2fthumb_20180330092342_346.jpg&ehk=WE0D13m8tQ3264YzAkka8EWN9RRwDUphWDnrxuUOeUE%3d&risl=&pid=ImgRaw&r=0', 'https://ts1.tc.mm.bing.net/th/id/R-C.dbf83fef9753a1d5e153f37bbcd3d79e?rik=h%2bpgTkDL%2fGMaow&riu=http%3a%2f%2fwww.jbbaoan.com%2fuserfiles%2f3(10).jpg&ehk=RNYPFtnPtnSX0ysMsVfhQLx9p1RnP4Ttf4g8KyOUejo%3d&risl=&pid=ImgRaw&r=0', 'https://www.hfuu.edu.cn/_upload/article/images/a2/14/ea054e6b44fabd2e4f16e831b392/e042dbd8-b1c4-4797-847f-3fc8322657e3.jpg']
  op.id = '67ce879a21c82bf48b45db0d'
  await JpatrolModel.create(op)
  let data = await JpatrolModel.find()
  console.log(data)
}
// bnm() 
async function vbnm() {
  let op = {}
  op.name = "张三"
  op.id = 1
  await JbaseModel.create(op)
  let data = await JbaseModel.find()
  console.log(data)
}
// vbnm()
// UserModel 用户-保安
async function jxh() {
  let op = {}
  op.username = "lisi"
  op.password = "zxcvbnm"
  op.name = "李四"
  op.img = "https://ts1.tc.mm.bing.net/th/id/R-C.e3ad6cfe9991c58dd2d4fea8fff4d891?rik=%2fkjliTBuGgHYuw&riu=http%3a%2f%2fimg.wxcha.com%2ffile%2f201904%2f19%2fbb0dd09fea.jpg&ehk=UjbZgZzJO7Ow%2bdAkgLNMD1J29IgxrsDnSnDA8hLBCNw%3d&risl=&pid=ImgRaw&r=0"
  op.school = "贵族高级小学"
  op.power = 2
  await UserModel.create(op)
  let data = await UserModel.find()
  console.log(data)
}

// jxh() 登录
router.post('/jlogin', async (req, res) => {
  let form = req.body.form
  console.log(form);
  let data = await UserModel.findOne({ username: form.username, password: form.password })
  if (data) {
    res.send({
      code: 200,
      data: data
    })
  } else {
    res.send({
      code: 400,
      data: '用户名或密码错误'
    })
  }
})
// 渲染页面
router.get('/list', async (req, res) => {
  let data = await JpatrolModel.find()
  res.send({
    code: 200,
    data: data
  })
})




const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 1024 * 1024 * 50, 
    fileSize: 1024 * 1024 * 50 
  }
})


// addfault
router.post('/jaddfault', upload.any(), async (req, res) => {  
  let formData = req.body.formData
  await QuestionModel.create(formData)
  res.send({
    code: 200,
    data: 'ok'
  })
})
// 渲染上报的信息
router.get('/jaddlist', async (req, res) => {
  let data = await QuestionModel.find()
  res.send({
    code: 200,
    data: data
  })
})

// 修改上报信息的状态
router.get('/jupdate', async (req, res) => {
  let { _id, power } = req.query
  console.log(_id, power);
  // 修改数据
  await QuestionModel.findByIdAndUpdate(_id, { num: power })

  res.send({
    code: 200,
    data: 'ok'
  })
})


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;

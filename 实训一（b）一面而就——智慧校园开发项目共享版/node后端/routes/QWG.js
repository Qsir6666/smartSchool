var express = require("express");
var router = express.Router();
const { formatISO } = require("date-fns");
const dayjs = require("dayjs");

var jwt = require("jsonwebtoken");
let kouling = "123456";

const {
  classModel,
  studentModel,
  ChatHistoryModel,
  loginModel,
  VerificationCodeModel,
} = require("../db/index");

// 账号登录接口
router.post("/getLogin", async (req, res) => {
  let user = req.body;
  let rsp = await loginModel.findOne(user);

  if (rsp) {
    let token = jwt.sign(user, kouling);

    res.send({
      code: 200,
      msg: "登陆成功！",
      data: {
        userId: rsp._id, //用户_id
        name: rsp.name, //用户个人姓名
        img: rsp.img, //用户头像
        school: rsp.school, //用户所在学校
        jobposition: rsp.jobposition, //用户职位名称
        power: rsp.power, //是否保安？以及保安级别
      },
      token: "Bearer " + token, //token
    });
  } else {
    res.send({
      code: 400,
      msg: "登陆失败!请检查用户名/密码",
    });
  }
});

//手机号登录接口        前端对应 —— 点击”立即登录“按钮时触发
router.post("/phoneLogin", async (req, res) => {
  try {
    const { phone, code } = req.body; //接收手机号和用户输入的验证码
    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.send({
        code: 400,
        msg: "手机号格式不正确",
      });
    }

    // 去后端数据库寻找是否有对应手机号
    const user = await loginModel.findOne({ phone: phone });

    // 未找到时逻辑（手机号未注册，但此时手机已经发送并接收到了验证码）👇👇👇📌📌📌📌📌📌📌📌📌📌📌   
    if (!user) {
      // 创建账户
      const newUser = await loginModel.create({
        username: phone,
        password: "123456", // 默认密码
        name: phone, // 使用手机号作为默认名称
        img: "1",
        school: "保定振涛教育",
        jobposition: "教职人员",
        power: "-1",    //默认此人非保安
        phone: phone,   // 存储当前手机号
        loginimg: "",   //人脸头像默认没有
      })

      // 生成新用户的token
      const token = jwt.sign({ phone }, kouling);

      return res.send({
        code: 200,
        msg: "登录成功",
        data: {
          userId: newUser._id,
          name: newUser.name,
          img: newUser.img,
          school: newUser.school,
          jobposition: newUser.jobposition,
          power: newUser.power,
        },
        token: "Bearer " + token,
      });
    }

    // 找到时逻辑👇👇👇
    // 1、从后端获取验证码
    const validCode = await VerificationCodeModel.findOne({ phone })
      .sort({ createdAt: -1 }) // 获取最新验证码
      .limit(1);
    // 2、判断验证码是否过期
    if (!validCode) {
      return res.send({
        code: 401,
        msg: "验证码已过期，请重新获取",
      });
    }
    // 3、再次检查验证码是否过期（5分钟有效期）
    const now = new Date();
    const codeTime = new Date(validCode.createdAt);
    const diffMinutes = Math.floor((now - codeTime) / 1000 / 60);
    if (diffMinutes > 5) {
      return res.send({
        code: 401,
        msg: "验证码已过期，请重新获取",
      });
    }

    // 如果前端传递的验证码 不能对应后端正确验证码时逻辑👇
    if (validCode.code !== code) {
      return res.send({
        code: 402,
        msg: "验证码有误，请重新输入",
      });
    }

    // 能对应上，手机号验证码无误，执行登录逻辑👇👇👇👇👇
    const token = jwt.sign({ phone }, kouling);
    // 登录成功，清理后端中已使用的验证码
    await VerificationCodeModel.deleteMany({ phone });

    res.send({
      code: 200,
      msg: "登录成功",
      data: {
        userId: user._id,
        name: user.name,
        img: user.img,
        school: user.school,
        jobposition: user.jobposition,
        power: user.power,
      },
      token: "Bearer " + token,
    });
  } catch (error) {
    console.error("手机登录错误:", error);
    res.send({
      code: 500,
      msg: "服务器错误",
    });
  }
});

// 给指定手机号发送验证码👇      前端对应 —— 点击”获取验证码“按钮时触发     （只要触发，就能正常发送验证码）
let SendVerificationCode = require("./utils/sendVerificationCode");
router.post("/getCode", async (req, res) => {
  try {
    let { phone } = req.body;
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.send({ code: 400, msg: "手机号格式不正确" });
    }

    // 生成并保存验证码
    const { status, code } = await SendVerificationCode(phone);
    if (status == 200) {
      // 存储验证码到数据库
      await VerificationCodeModel.create({
        phone,
        code,
        createdAt: new Date(),
      });
      return res.send({ code: 200, msg: "验证码已发送" });
    } else {
      return res.send({ code: 500, msg: "验证码发送失败" });
    }
  } catch (error) {
    console.error("发送验证码错误:", error);
    res.send({ code: 500, msg: "服务器错误" });
  }
});

// 通过不同的班级不同的日期，去获取不同的学生及学生状态
router.post("/getStudentsByClass", async (req, res) => {
  try {
    const { pickerValue, searchVal, dateStr } = req.body; // 班级信息、搜索关键字、 所选日期
    const [classValue, gradeValue] = pickerValue;
    const classInfo = await classModel.findOne({
      class: classValue,
      grade: gradeValue,
    });
    // 筛选出所选班级的所有学生
    const students = await studentModel
      .find({
        name: RegExp(searchVal), //模糊搜索
        classid: classInfo._id,
      })
      .lean();
    // 计算所选班级学生总人数
    const [total] = await Promise.all([
      studentModel.countDocuments({ classid: classInfo._id }),
    ]);
    // 对日期的处理
    const targetDate = new Date(dateStr);
    const start = new Date(targetDate).setUTCHours(0, 0, 0, 0);
    const end = new Date(targetDate).setUTCHours(23, 59, 59, 999);
    const processedStudents = students.map((student) => {
      // 查找该日期范围内的最早记录
      const matchedRecords = student.attendance.filter(
        (a) => a.date >= start && a.date <= end
      );
      return {
        _id: student._id,
        name: student.name,
        classid: student.classid,
        cate: matchedRecords.length ? matchedRecords[0].cate : "", // 返回空字符串表示无记录
      };
    });
    // console.log(classInfo,total);

    // 处理是否当天已上传数据
    const hasSubmitted =
      processedStudents.length > 0 &&
      processedStudents.every((s) => s.cate !== "");
    res.send({
      code: 200,
      data: {
        classInfo: classInfo, //返回班级信息（包括教师及其联系方式）
        students: processedStudents, //返回筛选后的学生数据
        total, //返回学生总数
        hasSubmitted, //表示是否今日已经提交数据 （用于前端判断状态）
      },
    });
  } catch (err) {
    res.status(500).send({ code: 500, msg: "服务器错误" });
  }
});

// 上传当天考勤数据
router.post("/sendKq", async (req, res) => {
  try {
    const { classId, dateStr, studentsData } = req.body;
    // 参数校验
    if (!classId || !studentsData?.length) {
      return res.status(400).send({ code: 400, msg: "参数不完整" });
    }
    // 日期范围计算
    const targetDate = new Date(dateStr);
    const start = new Date(targetDate).setUTCHours(0, 0, 0, 0);
    const end = new Date(targetDate).setUTCHours(23, 59, 59, 999);
    // 批量更新操作
    const bulkOps = studentsData.map((student) => ({
      updateOne: {
        filter: { _id: student._id }, // 仅通过ID匹配
        update: {
          // 分两步操作避免冲突
          $pull: { attendance: { date: { $gte: start, $lte: end } } },
        },
      },
    }));
    // 先删除旧记录
    await studentModel.bulkWrite(bulkOps);
    // 添加新记录
    const insertOps = studentsData.map((student) => ({
      updateOne: {
        filter: { _id: student._id },
        update: {
          $push: {
            attendance: {
              date: Date.now(), // 使用当前时间戳
              cate: student.attendance[0].cate,
            },
          },
        },
      },
    }));

    // 执行批量操作
    // console.log(bulkOps, '123123123')
    const result = await studentModel.bulkWrite(insertOps);
    // console.log(result)

    res.send({
      code: 200,
      data: {
        insertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (err) {
    // console.error('考勤提交错误', err)
    res.status(500).send({
      code: 500,
      msg: err.message || "考勤数据保存失败",
    });
  }
});

// 考勤报表页面接口
router.post("/getStatsData", async (req, res) => {
  try {
    const { dateStr, mode } = req.body;
    // UTC时间处理
    const targetDate = new Date(dateStr);
    const getTimeRange = () => {
      if (mode === "day") {
        // 所选日期UTC时间范围
        const start = Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          0,
          0,
          0
        );
        const end = Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          23,
          59,
          999
        );
        return { $gte: start, $lte: end };
      } else {
        // 所选月份UTC时间范围
        const start = Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          1
        );
        const end = Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth() + 1,
          0, // 最后一天
          23,
          59,
          999
        );
        return { $gte: start, $lte: end };
      }
    };
    // 查询条件
    const timeCondition = {
      "attendance.date": getTimeRange(),
    };
    // 聚合查询
    const [totalStudents, categories] = await Promise.all([
      studentModel.countDocuments({}),
      studentModel.aggregate([
        { $unwind: "$attendance" },
        { $match: timeCondition },
        {
          $group: {
            _id: "$attendance.cate",
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, cate: "$_id", count: 1 } },
      ]),
    ]);
    // 数据构建结果
    const result = {
      total: totalStudents,
      attendance: ["1", "2", "3", "4"].reduce((acc, cate) => {
        acc[`cate${cate}`] =
          categories.find((i) => i.cate === cate)?.count || 0;
        return acc;
      }, {}),
    };
    // console.log('11111最终结果：', result)
    res.send({ code: 200, data: result });
    // console.log(result,'13qedaswf')
  } catch (err) {
    // console.error('[统计错误]', err)
    res.status(500).send({ code: 500, msg: "统计失败" });
  }
});

// 通过日期获取班级出勤数据
router.post("/getMsgByDate", async (req, res) => {
  try {
    const { date } = req.body;

    // 获取所有班级
    const classes = await classModel.find().lean();

    const result = await Promise.all(
      classes.map(async (cls) => {
        // 当天时间范围
        const start = new Date(date).setHours(0, 0, 0, 0);
        const end = new Date(date).setHours(23, 59, 59, 999);

        // 获取班级总人数
        const total = await studentModel.countDocuments({ classid: cls._id });

        // 使用聚合管道技术
        const attendanceStats = await studentModel.aggregate([
          { $match: { classid: cls._id } },
          { $unwind: "$attendance" },
          {
            $match: {
              "attendance.date": { $gte: start, $lte: end },
              "attendance.cate": { $in: ["2", "3", "4"] }, // 只统计需要特殊处理的项目
            },
          },
          {
            $group: {
              _id: "$attendance.cate",
              count: { $sum: 1 },
            },
          },
        ]);

        // 将统计结果转换为对象 {2: count, 3: count...}
        const statsObj = attendanceStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {});

        // 数字转中文映射函数
        function numberToChinese(numStr) {
          const collegeMap = {
            1: "人工智能学院",
            2: "云计算学院",
            3: "大数据学院",
            4: "数智传媒学院",
            5: "鸿蒙生态开发学院",
            6: "元宇宙学院",
          };
          const classMap = {
            1: "A",
            2: "B",
            3: "C",
          };
          return {
            college: collegeMap[numStr] || numStr,
            class: classMap[numStr] || numStr,
          };
        }

        // 处理数据格式
        return {
          name: `${numberToChinese(cls.class).college} 2501${
            numberToChinese(cls.grade).class
          }`,
          total: total,
          present:
            total -
            ((statsObj["2"] || 0) +
              (statsObj["3"] || 0) +
              (statsObj["4"] || 0)),
          cate2: statsObj["2"] || 0,
          cate3: statsObj["3"] || 0,
          cate4: statsObj["4"] || 0,
        };
      })
    );

    res.json({
      code: 200,
      data: result,
      message: "获取成功",
    });
  } catch (error) {
    // console.error('出勤数据获取失败:', error)
    res.status(500).json({ code: 500, message: "服务器内部错误" });
  }
});

// 查出所选班级内所有异常状态的学生
router.post("/getAttendanceStudents", async (req, res) => {
  // 错误修复：添加类型转换工具函数
  const getAttendanceType = (cate) => {
    const types = { 2: "病假", 3: "事假", 4: "旷课" };
    return types[cate] || "未知类型";
  };
  try {
    const { className, dateInfo } = req.body;
    // console.log(className);

    // console.log('[原始请求参数]', className, dateInfo)
    // 处理班级名称（兼容中文空格）
    const cleanClassName = className.replace(/\s+/g, " "); // 替换全角空格为半角
    const [gradePart, classNumPart] = cleanClassName.split(" ");

    // 中文数字转换（兼容一年级到六年级）
    const chineseNumberMap = {
      一: "1",
      二: "2",
      三: "3",
      四: "4",
      五: "5",
      六: "6",
    };
    const classValue = chineseNumberMap[gradePart.charAt(0)];
    // 获取班级数据
    const classData = await classModel.findOne({
      class: classValue,
      grade: classNumPart.replace("班", ""),
    });
    if (!classData)
      return res.status(404).json({ code: 404, msg: "班级不存在" });
    // 处理日期范围（严格按照传入日期计算）
    const date = new Date(dateInfo);
    const start = date.setHours(0, 0, 0, 0);
    const end = date.setHours(23, 59, 59, 999);
    const students = await studentModel.aggregate([
      {
        $match: {
          classid: classData._id,
          attendance: {
            $elemMatch: {
              date: { $gte: start, $lte: end },
              cate: { $in: ["2", "3", "4"] },
            },
          },
        },
      },
      { $unwind: "$attendance" },
      {
        $match: {
          "attendance.date": { $gte: start, $lte: end },
          "attendance.cate": { $in: ["2", "3", "4"] },
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          attendance: { $push: "$attendance" },
        },
      },
    ]);
    const result = students.map((student) => ({
      name: student.name,
      attendance: student.attendance.map((att) => ({
        type: getAttendanceType(att.cate),
      })),
    }));
    res.json({ code: 200, data: result });
  } catch (err) {
    // console.error('[异常学生查询错误]', err)
    res.status(500).json({ code: 500, msg: "服务器繁忙" });
  }
});

// 按照日期统计年组数据出勤情况
router.post("/getGroupMsgByDate", async (req, res) => {
  try {
    const { date } = req.body;
    const start = new Date(date).setHours(0, 0, 0, 0);
    const end = new Date(date).setHours(23, 59, 59, 999);

    // 获取按年级分组后的汇总数据
    const result = await classModel.aggregate([
      {
        $group: {
          _id: "$class", // 按class字段分组
          grades: { $push: "$_id" }, // 收集该年级所有班级的_id
          totalClasses: { $sum: 1 }, // 统计该年级班级数量
        },
      },
      {
        $lookup: {
          from: "students", // 关联学生表
          localField: "grades",
          foreignField: "classid",
          as: "students",
        },
      },
      {
        $project: {
          _id: 0,
          class: "$_id",
          totalStudents: { $size: "$students" }, // 年级总人数
          attendanceStats: {
            $reduce: {
              input: "$students.attendance",
              initialValue: { cate2: 0, cate3: 0, cate4: 0 },
              in: {
                cate2: {
                  $add: [
                    "$$value.cate2",
                    {
                      $size: {
                        $filter: {
                          input: "$$this",
                          as: "item",
                          cond: {
                            $and: [
                              { $gte: ["$$item.date", start] },
                              { $lte: ["$$item.date", end] },
                              { $in: ["$$item.cate", ["2"]] },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
                cate3: {
                  $add: [
                    "$$value.cate3",
                    {
                      $size: {
                        $filter: {
                          input: "$$this",
                          as: "item",
                          cond: {
                            $and: [
                              { $gte: ["$$item.date", start] },
                              { $lte: ["$$item.date", end] },
                              { $in: ["$$item.cate", ["3"]] },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
                cate4: {
                  $add: [
                    "$$value.cate4",
                    {
                      $size: {
                        $filter: {
                          input: "$$this",
                          as: "item",
                          cond: {
                            $and: [
                              { $gte: ["$$item.date", start] },
                              { $lte: ["$$item.date", end] },
                              { $in: ["$$item.cate", ["4"]] },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          name: {
            $switch: {
              branches: [
                // { case: { $eq: ["$class", "1"] }, then: "一年组" },
                // { case: { $eq: ["$class", "2"] }, then: "二年组" },
                // { case: { $eq: ["$class", "3"] }, then: "三年组" },
                // { case: { $eq: ["$class", "4"] }, then: "四年组" },
                // { case: { $eq: ["$class", "5"] }, then: "五年组" },
                // { case: { $eq: ["$class", "6"] }, then: "六年组" }
                { case: { $eq: ["$class", "1"] }, then: "人工智能学院" },
                { case: { $eq: ["$class", "2"] }, then: "云计算学院" },
                { case: { $eq: ["$class", "3"] }, then: "大数据学院" },
                { case: { $eq: ["$class", "4"] }, then: "数智传媒学院" },
                { case: { $eq: ["$class", "5"] }, then: "鸿蒙生态开发学院" },
                { case: { $eq: ["$class", "6"] }, then: "元宇宙学院" },
              ],
              // default: "未知年组"
              default: "未知学院",
            },
          },
          total: "$totalStudents",
          present: {
            $subtract: [
              "$totalStudents",
              {
                $add: [
                  "$attendanceStats.cate2",
                  "$attendanceStats.cate3",
                  "$attendanceStats.cate4",
                ],
              },
            ],
          },
          cate2: "$attendanceStats.cate2",
          cate3: "$attendanceStats.cate3",
          cate4: "$attendanceStats.cate4",
        },
      },
      {
        $sort: {
          class: 1, // 根据 class 字段升序排列 (1=升序, -1=降序)
        },
      },
    ]);
    // console.log(result)

    res.json({
      code: 200,
      data: result,
      message: "获取成功",
    });
  } catch (error) {
    console.error("出勤数据获取失败:", error);
    res.status(500).json({ code: 500, message: "服务器内部错误" });
  }
});

// 根据所选日期内 所有异常状态的学生 cate = 2、3、4
router.post("/getAllErrorByDate", async (req, res) => {
  try {
    const { dateStr } = req.body;

    // 处理时间范围
    const startDate = new Date(dateStr);
    startDate.setHours(0, 0, 0, 0);
    const start = startDate.getTime();
    const endDate = new Date(dateStr);
    endDate.setHours(23, 59, 59, 999);
    const end = endDate.getTime();

    const result = await studentModel.aggregate([
      {
        $match: {
          attendance: {
            $elemMatch: {
              date: { $gte: start, $lte: end },
              cate: { $in: ["2", "3", "4"] },
            },
          },
        },
      },
      { $unwind: "$attendance" },
      {
        $match: {
          "attendance.date": { $gte: start, $lte: end },
          "attendance.cate": { $in: ["2", "3", "4"] },
        },
      },
      {
        $lookup: {
          from: "class",
          localField: "classid",
          foreignField: "_id",
          as: "classInfo",
        },
      },
      { $unwind: "$classInfo" },
      {
        $group: {
          _id: "$classInfo.class",
          students: {
            $push: {
              _id: "$_id",
              name: "$name",
              cate: "$attendance.cate",
              class: {
                $concat: [
                  {
                    $switch: {
                      branches: [
                        {
                          case: { $eq: ["$classInfo.class", "1"] },
                          then: "人工智能学院",
                        },
                        {
                          case: { $eq: ["$classInfo.class", "2"] },
                          then: "云计算学院",
                        },
                        {
                          case: { $eq: ["$classInfo.class", "3"] },
                          then: "大数据学院",
                        },
                        {
                          case: { $eq: ["$classInfo.class", "4"] },
                          then: "数智传媒学院",
                        },
                        {
                          case: { $eq: ["$classInfo.class", "5"] },
                          then: "鸿蒙生态开发学院",
                        },
                        {
                          case: { $eq: ["$classInfo.class", "6"] },
                          then: "元宇宙学院",
                        },
                      ],
                      default: "未知",
                    },
                  },
                  "学院 ",
                  "2501",
                  {
                    $switch: {
                      branches: [
                        { case: { $eq: ["$classInfo.grade", "1"] }, then: "A" },
                        { case: { $eq: ["$classInfo.grade", "2"] }, then: "B" },
                        { case: { $eq: ["$classInfo.grade", "3"] }, then: "C" },
                      ],
                      default: "X",
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          grade: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", "1"] }, then: 1 },
                { case: { $eq: ["$_id", "2"] }, then: 2 },
                { case: { $eq: ["$_id", "3"] }, then: 3 },
                { case: { $eq: ["$_id", "4"] }, then: 4 },
                { case: { $eq: ["$_id", "5"] }, then: 5 },
                { case: { $eq: ["$_id", "6"] }, then: 6 },
              ],
            },
          },
          count: { $size: "$students" },
          students: 1,
        },
      },
      { $sort: { grade: 1 } },
    ]);

    res.json({ code: 200, data: result });
  } catch (error) {
    // console.error('查询异常:', error)
    res.status(500).json({ code: 500, message: "服务异常" });
  }
});

// 根据所选日期，返回前五天的出勤统计情况
router.post("/getFiveDayAttendance", async (req, res) => {
  try {
    const { dateStr } = req.body;

    const baseDate = new Date(dateStr);
    baseDate.setUTCHours(0, 0, 0, 0);
    // 生成时间戳范围（按毫秒算）
    const startTime = baseDate.getTime() - 4 * 86400000; // 前4天
    const endTime = baseDate.getTime() + 86400000 - 1; // 当日23:59:59.999

    const pipeline = [
      { $unwind: "$attendance" },
      {
        $match: {
          "attendance.date": {
            $gte: startTime,
            $lte: endTime,
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: { $toDate: "$attendance.date" },
              },
            },
            type: "$attendance.cate",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          present: {
            $sum: { $cond: [{ $eq: ["$_id.type", "1"] }, "$count", 0] },
          },
          sick: { $sum: { $cond: [{ $eq: ["$_id.type", "2"] }, "$count", 0] } },
          leave: {
            $sum: { $cond: [{ $eq: ["$_id.type", "3"] }, "$count", 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$_id.type", "4"] }, "$count", 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          present: 1,
          sick: 1,
          leave: 1,
          absent: 1,
        },
      },
    ];
    const rawData = await studentModel.aggregate(pipeline);

    const dateArray = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(baseDate);
      d.setUTCDate(d.getUTCDate() - (4 - i));
      return d.toISOString().split("T")[0];
    });

    const finalData = dateArray.map((date) => ({
      date,
      present: rawData.find((item) => item.date === date)?.present || 0,
      sick: rawData.find((item) => item.date === date)?.sick || 0,
      leave: rawData.find((item) => item.date === date)?.leave || 0,
      absent: rawData.find((item) => item.date === date)?.absent || 0,
    }));

    res.json({ code: 200, data: finalData });
  } catch (e) {
    // console.error('1111错误', e)
    res.status(500).json({ code: 500, message: "数据获取失败" });
  }
});

// 检查ai今日问候语
router.post("/checkGreeting", async (req, res) => {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const exists = await ChatHistoryModel.exists({
    isGreeting: true,
    timestamp: { $gt: todayStart },
  });
  res.send({ code: 200, exists });
});
// 保存消息（包括问候语）
router.post("/saveMessage", async (req, res) => {
  try {
    const { content, isAI, isGreeting } = req.body;
    const newMsg = new ChatHistoryModel({
      content,
      isAI,
      timestamp: Date.now(),
      isGreeting: isGreeting || false,
    });
    await newMsg.save();
    res.send({ code: 200, data: newMsg });
  } catch (err) {
    res.status(500).send({ code: 500, message: "保存失败" });
  }
});
// 获取全部历史记录
router.get("/getAihistory", async (req, res) => {
  try {
    const list = await ChatHistoryModel.find()
      .sort({ timestamp: -1 }) // 按时间倒序
      .lean();
    res.send({ code: 200, data: list });
  } catch (err) {
    res.status(500).send({ code: 500, message: "查询失败" });
  }
});

// Echarts图表所需数据考勤趋势接口
router.post("/getAttendanceTrend", async (req, res) => {
  try {
    const { days = 7 } = req.body;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    // 生成日期区间数组（UTC日期标准化）
    const dateArray = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return {
        dateStr: formatISO(date, { representation: "date" }), // 生成'YYYY-MM-DD'
        utcStart: Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate()
        ),
        utcEnd: Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          23,
          59,
          999
        ),
      };
    });
    // 并行查询每天数据
    const results = await Promise.all(
      dateArray.map(async ({ dateStr, utcStart, utcEnd }) => {
        const [totalAttendance, normalAttendance] = await Promise.all([
          // 总考勤记录
          studentModel.countDocuments({
            "attendance.date": { $gte: utcStart, $lte: utcEnd },
          }),
          // 正常出勤记录
          studentModel.countDocuments({
            attendance: {
              $elemMatch: {
                date: { $gte: utcStart, $lte: utcEnd },
                cate: "1",
              },
            },
          }),
        ]);

        return {
          date: dateStr,
          total: totalAttendance,
          normal: normalAttendance,
          rate:
            totalAttendance > 0
              ? ((normalAttendance / totalAttendance) * 100).toFixed(2)
              : 0,
        };
      })
    );
    res.send({ code: 200, data: results });
  } catch (err) {
    // console.error('[趋势接口错误]', err)
    res.status(500).send({ code: 500, msg: "获取趋势数据失败" });
  }
});

// Echarts5 图表所需数据考勤趋势接口
router.post("/getEcharts5Data", async (req, res) => {
  try {
    const { dateStr } = req.body;
    // console.log('接收到的日期参数:', dateStr)

    const start = Number(dayjs(dateStr).startOf("day").valueOf());
    const end = Number(dayjs(dateStr).endOf("day").valueOf());
    // console.log('时间戳范围:', start, '->', end)

    const result = await studentModel.aggregate([
      { $unwind: "$attendance" },
      {
        $match: {
          "attendance.date": {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $lookup: {
          from: "class",
          localField: "classid",
          foreignField: "_id",
          as: "classInfo",
        },
      },
      { $unwind: "$classInfo" },
      {
        $group: {
          _id: "$classid",
          // 先单独提取班级信息字段
          class: { $first: "$classInfo.class" },
          grade: { $first: "$classInfo.grade" },
          teacher: { $first: "$classInfo.teacherName" },
          // 统计数值
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$attendance.cate", "1"] }, 1, 0] },
          },
          sick: { $sum: { $cond: [{ $eq: ["$attendance.cate", "2"] }, 1, 0] } },
          leave: {
            $sum: { $cond: [{ $eq: ["$attendance.cate", "3"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$attendance.cate", "4"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          teacher: 1,
          // 在此处执行字符串拼接
          className: {
            $concat: [
              // { $toString: "$class" },
              // "年",
              // { $toString: "$grade" },
              // "班"
              {
                $switch: {
                  branches: [
                    // { case: { $eq: ["$class", "1"] }, then: "一" },
                    // { case: { $eq: ["$class", "2"] }, then: "二" },
                    // { case: { $eq: ["$class", "3"] }, then: "三" },
                    // { case: { $eq: ["$class", "4"] }, then: "四" },
                    // { case: { $eq: ["$class", "5"] }, then: "五" },
                    // { case: { $eq: ["$class", "6"] }, then: "六" }
                    { case: { $eq: ["$class", "1"] }, then: "人" },
                    { case: { $eq: ["$class", "2"] }, then: "云" },
                    { case: { $eq: ["$class", "3"] }, then: "大" },
                    { case: { $eq: ["$class", "4"] }, then: "数" },
                    { case: { $eq: ["$class", "5"] }, then: "鸿" },
                    { case: { $eq: ["$class", "6"] }, then: "元" },
                  ],
                  default: "未知年级",
                },
              },
              // "年",
              ".",
              { $toString: "$grade" },
              // "班"
            ],
          },
          total: 1,
          present: 1,
          sick: 1,
          leave: 1,
          absent: 1,
          attendanceRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$present", "$total"] }, 100] },
            ],
          },
          sortKey: {
            $add: [
              { $multiply: [{ $toInt: "$class" }, 100] }, // 年级部分
              { $toInt: "$grade" }, // 班级部分
            ],
          },
        },
      },
    ]);

    // console.log('查询结果:', JSON.stringify(result, null, 2))
    res.json({ code: 200, data: result });
  } catch (error) {
    // console.error('接口错误:', error)
    res.status(500).json({ code: 500, message: "服务器内部错误" });
  }
});

module.exports = router;

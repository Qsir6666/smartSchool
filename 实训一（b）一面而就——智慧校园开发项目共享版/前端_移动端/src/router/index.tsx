import { lazy } from "react";
import { Navigate } from "react-router-dom";
import AuthComponent from '../utils/authComponent.jsx'


// 基础页面
import Hello from '../Login/hello1.tsx' //登录
import Login from '../Login/Login.tsx' //登录
import Face from '../Login/components/Face.tsx'//人脸
import Layout from '../Layout/Layout.tsx' //nav模板  包括主页、信息、我的
const Index = lazy(() => import('../Layout/Components/Index/Index.tsx')) //01主页
const Msg = lazy(() => import('../Layout/Components/Message/Msg.tsx')) //02信息
const Mine = lazy(() => import('../Layout/Components/Mine/Mine.tsx')) //03我的
import Menu from '../Layout/Components/Index/menu.tsx' //主页 --更多页面


// 班级考勤模块、考勤报表模块   --from 齐文纲
import Bjkq from '../Layout/Components/Index/Qwg/Bjkq.tsx' //01班级考勤
import Kqtj from '../Layout/Components/Index/Qwg/Kqtj.tsx'  //02考勤报表
import Kqtj_detail1 from '../Layout/Components/Index/Qwg/kqtj_detail1.tsx'  //02考勤报表 --班级出勤统计
import Kqtj_1_child from '../Layout/Components/Index/Qwg/Kqtj_1_child.tsx'  //班级出勤统计子页面 --点击跳转展示单个班级数据
import Kqtj_detail2 from '../Layout/Components/Index/Qwg/kqtj_detail2.tsx'  //02考勤报表 --年组横向对比
import Kqtj_detail3 from '../Layout/Components/Index/Qwg/kqtj_detail3.tsx'  //02考勤报表 --异常学生统计

//何百川
const QingJia = lazy(() => import('../Layout/Components/HBCpages/qingjia.tsx'))
const QingDeng=lazy(()=>import('../Layout/Components/HBCpages/qingdeng.tsx'))
const RiLi=lazy(()=>import('../Layout/Components/HBCpages/rili.tsx'))
const Xiang=lazy(()=>import('../Layout/Components/HBCpages/xiang.tsx'))
const Baobiao=lazy(()=>import('../Layout/Components/HBCpages/baobiao.tsx'))
const XiangBao=lazy(()=>import('../Layout/Components/HBCpages/xiangbao.tsx'))
const DaKa=lazy(()=>import('../Layout/Components/HBCpages/daka.tsx'))
const JiaoQing=lazy(()=>import('../Layout/Components/HBCpages/jiaojia.tsx'))
const ShenPi=lazy(()=>import('../Layout/Components/HBCpages/shenpi.tsx'))
const TongJi=lazy(()=>import('../Layout/Components/HBCpages/tongji.tsx'))
const Jia=lazy(()=>import('../Layout/Components/HBCpages/jia.tsx'))

//杨振宇
const Report = lazy(() => import('../Layout/Components/YZYpages/Report/Report.tsx')) //上报隐患
const Examine = lazy(() => import('../Layout/Components/YZYpages/Examine/Examine.tsx')) // 日常检查
// const ExamineDate = lazy(() => import('../Layout/Components/YZYpages/ExamineDate/ExamineDate.tsx')) //检查隐患
const Check = lazy(() => import('../Layout/Components/YZYpages/Check/Check.tsx')) //隐患排查
const Detail = lazy(() => import('../Layout/Components/YZYpages/Yzy/Detail.tsx')) //隐患详情
const Faction = lazy(() => import('../Layout/Components/YZYpages/Yzy/Faction.tsx')) //派指人员维修
const Sweep = lazy(() => import('../Layout/Components/YZYpages/Yzy/Sweep.tsx')) //二维码扫描
// const Qrcode = lazy(() => import('../Layout/Components/YZYpages/Qrcode.tsx')) //派指人员维修
const Chuli = lazy(() => import('../Layout/Components/YZYpages/Yzy/Chuli.tsx')) //派指人员维修

 
// 贾晓虎
import Nurse from '../Layout/Components/JXHpages/Nurse/nurse.tsx'
import Mission from '../Layout/Components/JXHpages/Mission/mission.tsx'
import Nurses from '../Layout/Components/JXHpages/Nurse/nurses.tsx'
import Addfault from "../Layout/Components/JXHpages/Nurse/addFault.tsx"
import Safe from '../Layout/Components/JXHpages/Safe/safe.tsx'
import Jchat from '../Layout/Components/JXHpages/Chat/chat.tsx'
import ThreeImg from "../Layout/Components/JXHpages/Nurse/threeImg.tsx";
import Jmsg from '../Layout/Components/JXHpages/Jmsg/jmsg.tsx'
import Jmsgs from '../Layout/Components/JXHpages/Jmsg/jmsgs.tsx'

const routes = [
	{ path: '/', element: <Navigate to="/hello"></Navigate> },

	{ path: '/hello', element: <Hello></Hello> },
	{ path: '/login', element: <Login></Login> },
	{ path: '/face', element: <Face></Face> },

	{
		path: '/layout',
		element: <AuthComponent><Layout/></AuthComponent> ,
		children: [
			{ index: true, element: <Index></Index> },
			{ path: 'msg', element: <Msg></Msg> },
			{ path: 'mine', element: <Mine></Mine> }
		]
	},
	{ path: '/menu', element: <AuthComponent><Menu/></AuthComponent> },

	// qwg
	{ path: '/bjkq', element:<AuthComponent><Bjkq /></AuthComponent>},//班级学生考勤页面
	{ path: '/kqtj', element:<AuthComponent><Kqtj /></AuthComponent>},//考勤统计页面
	{ path: '/kqtj_detail1', element: <AuthComponent><Kqtj_detail1 /></AuthComponent> },//考勤统计1 ——按照班级统计页面
	{ path: '/kqtj_1_child', element: <AuthComponent><Kqtj_1_child /></AuthComponent> },//考勤统计1.1 ——展示单个班级考勤
	{ path: '/kqtj_detail2', element: <AuthComponent><Kqtj_detail2 /></AuthComponent> },//考勤统计2 ——按照年组展示考勤
	{ path: '/kqtj_detail3', element: <AuthComponent><Kqtj_detail3 /></AuthComponent> },//考勤统计3 ——异常学生统计

	//何百川
	{ path: '/qingjia', element: <AuthComponent><QingJia /></AuthComponent>},
	{path:'/qingdeng',element:<AuthComponent><QingDeng/></AuthComponent>},
	{path:'/rili',element:<AuthComponent><RiLi/></AuthComponent>},
	{path:'/xiang',element:<AuthComponent><Xiang/></AuthComponent>},
	{path:'/bao',element:<AuthComponent><Baobiao/></AuthComponent>},
	{path:'/xibao',element:<AuthComponent><XiangBao/></AuthComponent>},
	{path:'/daka',element:<AuthComponent><DaKa/></AuthComponent>},
	{path:'/jiaoqing',element:<AuthComponent><JiaoQing/></AuthComponent>},
	{path:'/shenpi',element:<AuthComponent><ShenPi/></AuthComponent>},
	{path:'/tongji',element:<AuthComponent><TongJi/></AuthComponent>},
	{path:'/jia',element:<AuthComponent><Jia/></AuthComponent>},

	// 杨振宇
	{ path: '/report', element: <AuthComponent><Report /></AuthComponent> }, //上报隐患
	{ path: '/examine', element: <AuthComponent><Examine /></AuthComponent> }, // 日常检查
	// // { path: '/ExamineDate', element: <AuthComponent><ExamineDate /></AuthComponent> },	// 检查页面(未检查，已检查)
	{ path: '/Check', element: <AuthComponent><Check /></AuthComponent> }, // 隐患排查
	{ path: '/Detail', element: <AuthComponent><Detail /></AuthComponent> },//隐患详情
	{ path: '/Faction', element: <AuthComponent><Faction /></AuthComponent> },//派指人员维修
	{path:'/Sweep',element: <AuthComponent><Sweep/></AuthComponent>},	// 扫一扫
	// {path:'/Qrcode',element: <AuthComponent><Qrcode/></AuthComponent>},
	{path:'/Chuli',element: <AuthComponent><Chuli/></AuthComponent>},


	// 贾晓虎
	{ path: '/nurse', element: <AuthComponent><Nurse /></AuthComponent> },
	{ path: '/mission', element: <AuthComponent><Mission /></AuthComponent> },
	{ path: '/nurses', element: <AuthComponent><Nurses /></AuthComponent> },
	{ path: '/addfault', element: <AuthComponent><Addfault /></AuthComponent> },
	{ path: '/safe', element: <AuthComponent><Safe /></AuthComponent> },
	{ path: '/jchat', element: <AuthComponent><Jchat /></AuthComponent> },
	{ path: '/threeImg', element: <AuthComponent><ThreeImg /></AuthComponent> },
	{ path: '/jmsg', element: <AuthComponent><Jmsg /></AuthComponent> },
	{ path: '/jmsgs', element: <AuthComponent><Jmsgs /></AuthComponent> },
]

export default routes 
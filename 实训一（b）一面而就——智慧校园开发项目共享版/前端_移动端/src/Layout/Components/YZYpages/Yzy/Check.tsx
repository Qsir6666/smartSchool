// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Tabs, TabPane, List, ListItem } from '@/components/ui/tabs';
// import { TimeFormatter } from '@/components/time-formatter';
// import { Dialog } from '@/components/ui/dialog';
// import { NavBar } from '@/components/ui/navbar';
// import { ArrowLeft } from 'lucide-react';
// import { ImagePreview } from '@/components/ui/image-preview';
// import { QRCodeGenerator } from '@/components/ui/qr-code-generator';

// interface HiddenTrouble {
//   _id: string;
//   type: string;
//   place: string;
//   detail: string;
//   PhotosOrVideos: string[];
//   time: string;
//   state: string;
//   dispose: boolean;
//   repai?: string;
//   date?: string;
//   peple?: string;
// }

// const Check: React.FC = () => {
//   const nav = useNavigate();
//   const [activeTab, setActiveTab] = useState(0);
//   const [troubles, setTroubles] = useState<HiddenTrouble[]>([]);
//   const [details, setDetails] = useState<HiddenTrouble | null>(null);
//   const [showPreview, setShowPreview] = useState(false);

//   useEffect(() => {
//     fetchTroubles();
//   }, [activeTab]);

//   const fetchTroubles = async () => {
//     try {
//       // 根据activeTab获取不同状态的隐患
//       const response = await fetch(`${API_BASE_URL}/api/hidden-trouble?state=${activeTab + 1}`);
//       const data = await response.json();
//       if (data.success) {
//         setTroubles(data.data);
//       }
//     } catch (error) {
//       console.error('获取隐患列表失败:', error);
//       Dialog.alert({
//         title: "错误",
//         content: "获取数据失败，请重试",
//       });
//     }
//   };

//   const handleItemClick = (item: HiddenTrouble) => {
//     console.log(item);
//     setDetails(item);
//     nav('/detail', { state: { item } });
//   };

//   const getStatusText = (state: string) => {
//     switch (state) {
//       case '1':
//         return '待审核';
//       case '2':
//         return '处理中';
//       case '3':
//         return '已完成';
//       case '4':
//         return '我的';
//       default:
//         return '未知状态';
//     }
//   };

//   return (
//     <div className={style.box}>
//       <NavBar
//         className={style.navbar}
//         back={
//           <>
//             <ArrowLeft />
//             返回
//           </>
//         }
//         onBackClick={() => nav(-1)}
//       >
//         审核
//       </NavBar>

//       <div className={style.content}>
//         {details && (
//           <>
//             <div className={style.boxHerd}>
//               <div className={style.boxHerdTow}>
//                 <span className={style.description}>隐患描述: {details.detail}</span>
//                 <div className={style.imageContainer}>
//                   <img
//                     src={details.PhotosOrVideos[0]}
//                     alt="隐患照片"
//                     onClick={() => setShowPreview(true)}
//                     className={style.previewImage}
//                   />
//                   <ImagePreview
//                     autoPlay={0}
//                     images={details.PhotosOrVideos}
//                     visible={showPreview}
//                     onClose={() => setShowPreview(false)}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className={style.central}>
//               <div className={style.centralTow}>
//                 <span>隐患类型</span>
//                 <span className={style.value}>{details.type}</span>
//               </div>
//               <div className={style.centralTow}>
//                 <span>隐患地点</span>
//                 <span className={style.value}>{details.place}</span>
//               </div>
//             </div>

//             <div className={style.qrcodeContainer}>
//               <QRCodeGenerator
//                 value={JSON.stringify({
//                   _id: details._id,
//                   type: 'hazard',
//                   state: details.state,
//                   timestamp: Date.now()
//                 })}
//                 size={200}
//               />
//               <p className={style.qrcodeText}>扫描二维码查看隐患详情</p>
//             </div>
//           </>
//         )}

//         <div className={style.processSection}>
//           <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
//             <TabPane title="待审核">
//               <List>
//                 {troubles.map((item) => (
                  
//                   <ListItem
//                     key={item._id}
//                     onClick={() => handleItemClick(item)}
//                     title={item.detail}
//                     description={
//                       <>
//                       <span>{item.state}</span>
//                         <p>地点：{item.place}</p>
//                         <p>状态：{getStatusText(item.state)}</p>
//                         <p>时间：<TimeFormatter date={item.time} format="YYYY-MM-DD HH:mm:ss" /></p>
//                       </>
//                     }
//                   />
//                 ))}
//               </List>
//             </TabPane>
//             <TabPane title="处理中">
//               {/* 同上的List组件 */}
//             </TabPane>
//             <TabPane title="已完成">
//               {/* 同上的List组件 */}
//             </TabPane>
//             <TabPane title="我的">
//               {/* 同上的List组件 */}
//             </TabPane>
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Check; 
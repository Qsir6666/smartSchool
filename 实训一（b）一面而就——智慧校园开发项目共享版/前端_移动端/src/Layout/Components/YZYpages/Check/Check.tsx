import React, { useState, useEffect,  } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar, Loading,  } from "@nutui/nutui-react";
import { ArrowLeft  } from "@nutui/icons-react";
import Check from "../css/check.module.css";
import userService from "../axios/userService";
import TimeFormatter from "../pages/TimeFormatter";
import QRCodeGenerator from "../pages/Qrcode";
import QRCodeSVG from "qrcode.react";

import img from '/imgs/login/app.png'



// 定义用户信息的类型
interface UserInfo {
  imgs: string;
  userName: string;
  school: string;
}

// 定义隐患信息的类型
interface HiddenInfo {
  _id: string;
  userName: UserInfo;
  state: number;
  time: string | Date;
  detail: string;
  PhotosOrVideos: string;
  place: string;
}

// 定义组件
const App: React.FC = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState<any[]>([]);
  const [hidden, setHidden] = useState<HiddenInfo[]>([]);
  const [audit, setAudit] = useState(0);
  const [dispose, setDispose] = useState(0);
  const [finish, setFinish] = useState(0);
  const [cate, setCate] = useState("1");
  const [hiddenTow, setHiddenTow] = useState<HiddenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const details = (i: HiddenInfo) => {
    navigate("/Detail", { state: { ...i } });
  };

  // 获取登录用户
  const getLogin = async () => {
    try {
      const data = await userService.login();
      setLogin(data);
    } catch (error) {
      // console.error("加载登陆用户信息失败", error);
    } finally {
      // 检查是否两个请求都完成
      if (!isLoadingUser) {
        setIsLoading(false);
      }
    }
  };

  // 获取上报的隐患信息
  const getHidden = async () => {
    try {
      const hiddenData = await userService.hiddenUsers();
      // console.log(hidden,'11111111111');
      
      setHidden(hiddenData);
    } catch (error) {
      // console.error("加载隐患信息失败", error);
    } finally {
      // 检查是否两个请求都完成
      if (!isLoadingHidden) {
        setIsLoading(false);
      }
    }
  };

  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingHidden, setIsLoadingHidden] = useState(true);

  const hiddenNum = () => {
    const stateCount = { 1: 0, 2: 0, 3: 0 };

    hidden.forEach((item: HiddenInfo) => {
      if (stateCount.hasOwnProperty(item.state)) {
        stateCount[item.state]++;
      }
    });
    const { 1: stateS, 2: stateB, 3: stateC } = stateCount;
    setAudit(stateS);
    setDispose(stateB);
    setFinish(stateC);
  };

  // 类别筛选
  useEffect(() => {
    hiddenNum();
  }, [hidden]);

  useEffect(() => {
    setIsLoadingUser(true);
    setIsLoadingHidden(true);
    const fetchData = async () => {
      try {
        await Promise.all([
          (async () => {
            await getLogin();
            setIsLoadingUser(false);
          })(),
          (async () => {
            await getHidden();
            setIsLoadingHidden(false);
          })()
        ]);
      } finally {
        if (!isLoadingUser && !isLoadingHidden) {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, []);

  const sx = () => {
    let acc = [...hidden];
    acc = hidden.filter((item: HiddenInfo) => item.state.toString() === cate);
    // console.log(acc);
    setHiddenTow([...acc]);
  };

  useEffect(() => {
    sx();
  }, [cate]);

  const renderQRCode = (item: HiddenInfo) => {
    // 构建友好文本格式（用于外部扫描）
    const statusText = item.state === 1 ? "未处理" : 
                       item.state === 2 ? "处理中" : 
                       item.state === 3 ? "已完成" : "未知";
                       
    // 增强版二维码内容，包含所有必要的信息
    const qrValue = 
`隐患信息
━━━━━━━━━━━━━━
📝 描述：${item.detail}
📍 地点：${item.place}
⏰ 上报时间：${item.time instanceof Date ? item.time.toLocaleString() : item.time}
🔄 状态：${statusText}
🖼️ 图片：${item.PhotosOrVideos}

YZY_${item._id}_${item.state}_${encodeURIComponent(item.place)}_${encodeURIComponent(item.PhotosOrVideos)}`;

    return (
      <QRCodeGenerator 
        value={qrValue}
        level="H" // 增加错误纠正能力
      />
    );
  };

  return (
    <>
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <Loading text="正在加载..." />
        </div>
      )}
      <div className={Check.aaaaaa}>
        <NavBar
          className={Check.navbarOne}
          // right={
          //   <span onClick={(e) => navigate("/report")}>
          //     <Add />
          //   </span>
          // }
          back={<ArrowLeft />}
          onBackClick={(e) => {
            navigate("/layout");
          }}
        >
          <div className="title">
            <span className="desc">隐患排查</span>
          </div>
        </NavBar>
        <div className={Check.boxOne}>
          <ul className={Check.boxUl}>
            <li
              onClick={() => setCate("1")}
              className={cate === "1" ? Check.li_active : ""}
            >
              待审核 ({audit})
            </li>
            <li
              onClick={() => setCate("2")}
              className={cate === "2" ? Check.li_active : ""}
            >
              处理中 ({dispose})
            </li>
            <li
              onClick={() => setCate("3")}
              className={cate === "3" ? Check.li_active : ""}
            >
              已完成 ({finish})
            </li>
          </ul>
        </div>
      </div>
      <div className={Check.box}>
        {hiddenTow.length > 0 &&
          hiddenTow.map((i: HiddenInfo) => (
            <div className={Check.boxTow} key={i.time + i.detail}>
              <div className={Check.head} onClick={() => details(i)}>
                <div className={Check.headLeft}>
                  <div style={{ float: "left" }}>
                    <img
                      src={img}
                      alt=""
                      width={45}
                      height={45}
                      style={{ borderRadius: "50px" }}
                    />
                  </div>
                  <div style={{ marginLeft: "10px" }}>
                    <ul style={{ listStyle: "none" }}>
                      <li style={{ fontSize: "16px" }}>
                        {/* {i.userName.userName} */}
                      </li>
                      {/* <li>{i.userName.school}</li> */}
                    </ul>
                  </div>
                </div>
                <div className={Check.headRight}>
                  <div
                    className={Check.headFont}
                    style={{
                      backgroundColor:
                        i.state == 1
                          ? "#ffcc66"
                          : i.state == 2
                          ? "#ff6600"
                          : i.state == 3
                          ? "#00cc00"
                          : "#ff6600",
                    }}
                  >
                    {i.state == 1
                      ? "待审查"
                      : i.state == 2
                      ? "处理中"
                      : i.state == 3
                      ? "已完成"
                      : "我的"}
                  </div>
                </div>
              </div>
              <div className={Check.buttom}>
                <ul
                  style={{
                    listStyle: "none",
                    fontSize: "17px",
                    marginTop: "10px",
                    marginLeft: "10px",
                  }}
                >
                  <li>
                    上报时间：
                    <TimeFormatter date={i.time} format="YYYY-MM-DD HH:mm:ss" />
                  </li>
                  <li>隐患描述：{i.detail}</li>
                  <li style={{ marginTop: "7px", marginLeft: "5px" }}>
                    {i.PhotosOrVideos ? (
                      <img 
                        src={i.PhotosOrVideos} 
                        width="90px" 
                        height="80px" 
                        alt="隐患图片"
                        onError={(e) => {
                          e.currentTarget.src = defaultImg;
                          e.currentTarget.onerror = null; // 防止循环错误
                        }}
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <img 
                        src={defaultImg} 
                        width="90px" 
                        height="80px" 
                        alt="无图片" 
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )}
                  </li>
                </ul>

                <div className={Check.erwei}>
                  {renderQRCode(i)}
                </div>
              </div>
            </div>
          ))}
        {!hiddenTow.length > 0 &&
          hidden.map((i: HiddenInfo) => {
            if (i.state.toString() === cate) {
              return (
                <div className={Check.boxTow} key={i.time + i.detail}>
                  <div className={Check.head} onClick={() => details(i)}>
                    <div className={Check.headLeft}>
                      <div style={{ float: "left" }}>
                        <img
                          src={img}
                          alt=""
                          width={45}
                          height={45}
                          style={{
                            backgroundColor: "red",
                            borderRadius: "50px",
                          }}
                        />
                      </div>
                      <div style={{ marginLeft: "10px" }}>
                        <ul style={{ listStyle: "none" }}>
                          <li style={{ fontSize: "16px" }}>
                            {/* {i.userName.userName} */}
                          </li>
                          {/* <li>{i.userName.school}</li> */}
                        </ul>
                      </div>
                    </div>
                    <div className={Check.headRight}>
                      <div
                        className={Check.headFont}
                        style={{
                          backgroundColor:
                            i.state == 1
                              ? "#ffcc66"
                              : i.state == 2
                              ? "#ff6600"
                              : i.state == 3
                              ? "#00cc00"
                              : "#ff6600",
                        }}
                      >
                        {i.state == 1
                          ? "待审查"
                          : i.state == 2
                          ? "处理中"
                          : i.state == 3
                          ? "已完成"
                          : "我的"}
                      </div>
                    </div>
                  </div>
                  <div className={Check.buttom}>
                    <ul
                      style={{
                        listStyle: "none",
                        fontSize: "17px",
                        marginTop: "10px",
                        marginLeft: "10px",
                      }}
                    >
                      <li>
                        上报时间：
                        <TimeFormatter
                          date={i.time}
                          format="YYYY-MM-DD HH:mm:ss"
                        />
                      </li>
                      <li>隐患描述：{i.detail}</li>
                      <li style={{ marginTop: "7px", marginLeft: "5px" }}>
                        {i.PhotosOrVideos ? (
                          <img 
                            src={i.PhotosOrVideos} 
                            width="90px" 
                            height="80px" 
                            alt="隐患图片"
                            onError={(e) => {
                              e.currentTarget.onerror = null; // 防止循环错误
                            }}
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <img 
                            width="90px" 
                            height="80px" 
                            alt="无图片" 
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                      </li>

                      <div className={Check.erwei}>
                        {renderQRCode(i)}
                      </div>
                    </ul>
                  </div>
                </div>
              );
            }
            return null;
          })}
      </div>
    </>
  );
};

export default App;
    
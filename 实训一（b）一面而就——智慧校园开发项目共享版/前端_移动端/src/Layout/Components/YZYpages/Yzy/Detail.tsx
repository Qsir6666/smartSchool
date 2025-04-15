import React, { useState, useEffect } from "react";
import { NavBar, Toast, Steps, Step, Button, ImagePreview } from '@nutui/nutui-react'
import { ArrowLeft } from '@nutui/icons-react'
import style from '../css/detail.module.css';
import { useLocation, useNavigate } from "react-router-dom";
import TimeFormatter from '../pages/TimeFormatter'
import { Dialog } from '@nutui/nutui-react'

interface DetailData {
  _id: string;
  type: string | { text: string, value: string };
  place: string;
  detail: string;
  PhotosOrVideos: string;
  time: string;
  state: string;
  dispose: boolean;
  repai?: string;
  date?: string;
  peple?: string;
}

interface LocationState {
  _id: string;
  state: string;
  [key: string]: any;
}

const Detail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loc = location.state as LocationState;
  const [details, setDetails] = useState<DetailData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [typeName, setTypeName] = useState("");
  const userName = loc.userName?.userName || '';

  useEffect(() => {
    if (loc) {
      setDetails(loc);
      
      if (loc.type) {
        if (typeof loc.type === 'object' && loc.type.text) {
          setTypeName(loc.type.text);
        } else if (typeof loc.type === 'string') {
          setTypeName("校园第三方建筑");
        }
      } else {
        setTypeName("校园第三方建筑");
      }
    }
  }, [loc]);

  const renderSteps = () => {
    const steps = [
      {
        value: '1',
        title: `${userName}上报隐患待审核`,
        description: (
          <>
            <p>提交时间：</p>
            <TimeFormatter date={details?.time} format="YYYY-MM-DD HH:mm:ss" />
          </>
        )
      },
      {
        value: '2',
        title: `${userName}已指派处理中`,
        description: (
          <>
            <p>指派人：维修员-李总</p>
            <p>处理期限：<TimeFormatter date={details?.time} format="YYYY-MM-DD" /></p>
            <p>确认隐患类型：校园第三方建筑</p>
          </>
        )
      },
      {
        value: '3',
        title: `${userName}处理完毕已完成`,
        description: (
          <>
            <p>完成时间：<TimeFormatter date={details?.time} format="YYYY-MM-DD" /></p>
          </>
        )
      }
    ];

    return steps.slice(0, Number(details?.state));
  };

  const handleFactionClick = () => {
    if (details && details._id) {
      navigate('/faction', { 
        state: { 
          id: details._id,
          type: details.type,
          place: details.place,
          detail: details.detail
        } 
      });
    } else {
      Dialog.alert({
        title: "错误",
        content: "无法获取隐患信息",
      });
    }
  };

  return (
    <div className={style.box}>
      <NavBar
        className={style.navbar}
        back={
          <>
            <ArrowLeft />
            返回
          </>
        }
        onBackClick={() => navigate("/Check")}
      >
        详情
      </NavBar>

      <div className={style.content}>
        <div className={style.boxHerd}>
          <div className={style.boxHerdTow}>
            <span className={style.description}>隐患描述: {details?.detail || "暂无描述"}</span>
            <div className={style.imageContainer}>
              {details?.PhotosOrVideos && (
                <img
                  src={details.PhotosOrVideos}
                  alt="隐患照片"
                  onClick={() => setShowPreview(true)}
                  className={style.previewImage}
                />
              )}
              <ImagePreview
                autoPlay={0}
                images={details?.PhotosOrVideos ? [details.PhotosOrVideos] : []}
                visible={showPreview}
                onClose={() => setShowPreview(false)}
              />
            </div>
          </div>
        </div>

        <div className={style.central}>
          <div className={style.centralTow}>
            <span>隐患类型</span>
            <span className={style.value}>{typeName}</span>
          </div>
          <div className={style.centralTow}>
            <span>隐患地点</span>
            <span className={style.value}>{details?.place || "暂无地点信息"}</span>
          </div>
        </div>

        <div className={style.processSection}>
          <h3>隐患流程</h3>
          <div className={style.stepsContainer}>
            <Steps direction="vertical" dot value={details?.state}>
              {renderSteps().map((step, index) => (
                <Step
                  key={step.value}
                  value={Number(step.value)}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </Steps>
          </div>

          {details?.state === '1' && (
            <Button
              block
              type="primary"
              className={style.assignButton}
              onClick={handleFactionClick}
            >
              派指
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detail;
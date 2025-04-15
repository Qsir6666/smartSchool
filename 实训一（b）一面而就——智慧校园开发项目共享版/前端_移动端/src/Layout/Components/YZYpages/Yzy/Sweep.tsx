import React, { useRef, useEffect, useState } from 'react';
import { NavBar, Toast, Dialog } from '@nutui/nutui-react';
import { ArrowLeft, Image as NutImage, Eye } from '@nutui/icons-react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import styles from './sweep.module.css';
import axios from 'axios';
// 引入axios配置
const BASE_URL = 'http://127.0.0.1:3000';

interface QRCodeResult {
  type: 'internal' | 'external' | 'unknown';
  content: string;
  timestamp: string;
  data?: {
    _id: string;
    state: string;
    detail: string;
    place: string;
    PhotosOrVideos: string;
    time?: string | Date;
    userName?: string;
  };
}

// 添加类型定义
interface HazardData {
  _id: string;
  state: string;
  detail: string;
  place: string;
  time: string;
  PhotosOrVideos: string;
  userName?: string;
}

const Sweep: React.FC = () => {
    const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<QRCodeResult | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

        const startCamera = async () => {
            try {
      setError(null);
                const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
          setScanning(true);
                        scanQRCode();
                    };
        streamRef.current = stream;
                }
            } catch (error) {
                console.error('无法访问摄像头', error);
      setError('请允许访问摄像头以继续使用此功能');
    }
  };

  const stopCamera = () => {
    setScanning(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
        startCamera();
        return () => {
      stopCamera();
        };
    }, []);

  const toggleFlashlight = async () => {
    try {
      if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        
        // 检查是否支持闪光灯
        const capabilities = track.getCapabilities();
        if (capabilities && 'torch' in capabilities) {
          const constraints = {
            advanced: [{ torch: !flashlightOn } as MediaTrackConstraintSet]
          };
          await track.applyConstraints(constraints);
          setFlashlightOn(!flashlightOn);
        } else {
          setError('您的设备不支持闪光灯控制');
        }
      }
    } catch (error) {
      console.error('闪光灯控制失败:', error);
      setError('无法控制闪光灯');
        }
    };

    const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (canvas.width > 0 && canvas.height > 0) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code) {
        // console.log('扫描到二维码:', code.data);
        setQrCodeData(code.data);
        stopCamera();
        handleScanResult(code.data);
      } else if (scanning) {
                requestAnimationFrame(scanQRCode);
            }
    } else if (scanning) {
            requestAnimationFrame(scanQRCode);
        }
    };

  const handleScanResult = (result: string) => {
    try {
      // 匹配 "YZY_id_state_place_photoUrl" 格式的二维码内容
      if (result.startsWith('YZY_')) {
        // 分割并提取数据
        const parts = result.split('_');
        
        // 新的增强格式
        if (parts.length >= 5) {
          const [, _id, state, encodedPlace, encodedPhotoUrl] = parts;
          if (_id && state) {
            // 解码URL编码的字段
            const place = decodeURIComponent(encodedPlace);
            const photoUrl = decodeURIComponent(encodedPhotoUrl);
            
            // 创建一个基本的数据对象，包含直接从二维码获取的信息
            const directData = {
              _id,
              state,
              place,
              PhotosOrVideos: photoUrl,
              detail: '正在获取详细信息...',
              time: new Date().toISOString()
            };
            
            // 设置扫描结果
            setLastResult({
              type: 'internal',
              content: result,
              timestamp: new Date().toISOString(),
              data: directData
            });
            
            // 尝试获取完整信息，但即使API调用失败，我们也有基本信息可以显示
            fetchHazardDetails(_id, state, directData);
            return;
          }
        } 
        // 旧格式兼容 (只有ID和状态)
        else if (parts.length >= 3) {
          const [, _id, state] = parts;
          if (_id && state) {
            // 获取完整的隐患数据
            fetchHazardDetails(_id, state);
            return;
          }
        }
      }
       
      // 检查是否包含分隔线，表示是我们的隐患信息格式
      if (result.includes('━━━━━━━━━━━━━━')) {
        // 尝试提取末尾的YZY信息
        const lines = result.split('\n');
        const lastLine = lines[lines.length - 1].trim();
        
        if (lastLine.startsWith('YZY_')) {
          // 递归调用自身处理提取出的YZY行
          handleScanResult(lastLine);
          return;
        }
        
        // 如果没有找到YZY标识，作为普通信息处理

        return;
      }

      // 其他格式的二维码
      setLastResult({
        type: 'external',
        content: result,
        timestamp: new Date().toISOString()
      });


    } catch (error) {
      console.error('解析二维码失败:', error);
      Toast.show({
        content: '解析二维码失败',
        duration: 2000
      });
    }
  };

  const handleResultClick = () => {
    if (lastResult?.type === 'internal' && lastResult.data) {
      const hazardData = lastResult.data;
      if (hazardData.state === '1') {
        nav('/Chuli', { state: hazardData });
      } else {
        nav('/Detail', { state: hazardData });
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const image = await loadImage(file);
      decodeQRCodeFromImage(image);
    } catch (error) {
      console.error('图片处理失败:', error);
      setError('图片加载失败，请选择正确的图片文件');
    }
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
            const reader = new FileReader();
      const img = document.createElement('img');
      
            reader.onload = (e) => {
        if (e.target?.result) {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('图片加载失败'));
          img.src = e.target.result as string;
        } else {
          reject(new Error('文件读取失败'));
        }
      };
      
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
    };

    const decodeQRCodeFromImage = (image: HTMLImageElement) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('无法创建画布上下文');
      return;
    }

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert', 
        });

        if (code) {
        setQrCodeData(code.data);
        handleScanResult(code.data);
        } else {
        setError('未检测到二维码，请确保图片清晰可见');
      }
    } catch (error) {
      console.error('二维码解析错误:', error);
      setError('二维码解析失败，请重试');
    }
  };

  // 修改函数签名，接受可选的直接数据参数
  const fetchHazardDetails = async (_id: string, state: string, directData?: any) => {
    try {
      // 显示加载提示
      // Toast.show({
      //   content: '正在获取隐患信息...',
      //   duration: 1000
      // });
      
      // 使用API获取完整隐患数据
      const response = await fetch(`http://localhost:3000/YZY/hidden`);
      const { data } = await response.json();
      
      // 找到匹配的隐患记录
      const hazardData = data.find((item: any) => item._id === _id);
      
      if (hazardData) {
        // 准备详情页所需的完整数据对象
        const detailData = {
          _id: hazardData._id,
          state: hazardData.state,
          detail: hazardData.detail || "暂无描述",
          place: hazardData.place || "暂无地点",
          time: hazardData.time || new Date().toISOString(),
          PhotosOrVideos: hazardData.PhotosOrVideos || "",
          userName: hazardData.userName,
          // 可以添加其他需要的字段
          type: hazardData.type,
          dispose: hazardData.dispose
        };
        
        // 设置内部扫描结果
        setLastResult({
          type: 'internal',
          content: `YZY_${_id}_${state}`,
          timestamp: new Date().toISOString(),
          data: {
            _id: detailData._id,
            state: detailData.state,
            detail: detailData.detail,
            place: detailData.place,
            time: detailData.time,
            PhotosOrVideos: detailData.PhotosOrVideos,
            userName: detailData.userName
          }
        });
        
        // 根据状态跳转到对应页面
        if (state === '1') {
          nav('/Chuli', { state: detailData });
        } else if (state === '2'){
          nav('/Chuli', { state: detailData });
        }else if (state === '3'){
          nav('/Chuli', { state: detailData });
        }
        
        // else {
        //   nav('/Detail', { state: detailData });
        // }
      } else if (directData) {
        // 如果没有找到记录但有直接数据，使用直接数据
        if (state === '1') {
          nav('/Chuli', { state: directData });
        } else if (state === '2'){
          nav('/Chuli', { state: directData });
        }else if (state === '3'){
          nav('/Chuli', { state: directData });
        }
        
        // else {
        //   nav('/Detail', { state: directData });
        // }
      } else {
        // 未找到数据时使用基本信息
        const basicHazardData = {
          _id,
          state,
          detail: '获取详情失败',
          place: '未知位置',
          time: new Date().toISOString(),
          PhotosOrVideos: ''
        };
        
        if (state === '1') {
          nav('/Chuli', { state: basicHazardData });
        }else if (state === '2'){
          nav('/Chuli', { state: directData });
        }else if (state === '3'){
          nav('/Chuli', { state: directData });
        } 
        
        // else {
        //   nav('/Detail', { state: basicHazardData });
        // }
        
        Toast.show({
          content: '无法获取完整隐患信息',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('获取隐患详情失败:', error);
      
      // 如果有直接数据，直接使用
      if (directData) {
        if (state === '1') {
          nav('/Chuli', { state: directData });
        } else {
          nav('/Detail', { state: directData });
        }
        return;
      }
      
      // 出错时使用基本信息
      const basicHazardData = {
        _id,
        state,
        detail: '获取详情失败',
        place: '未知位置',
        time: new Date().toISOString(),
        PhotosOrVideos: ''
      };
      
      if (state === '1') {
        nav('/Chuli', { state: basicHazardData });
      } else {
        nav('/Detail', { state: basicHazardData });
      }
      
      Toast.show({
        content: '获取隐患详情失败',
        duration: 2000
      });
    }
  };

    return (
    <div className={styles.box}>
            <NavBar
        style={{ backgroundColor: 'transparent', position: 'fixed', width: '100%', zIndex: 10 }}
                back={<ArrowLeft style={{ color: 'white' }} />}
        onBackClick={() => {
          stopCamera();
          nav(-1);
        }}
      />

      {error && (
        <div className={styles.result}>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.mask} />
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={styles.video}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className={styles.boxOne}>
        <div className={styles.boxsweep}>
          <div className={styles.corner}></div>
          <div className={styles.corneri}></div>
          <div className={styles.cornerl}></div>
          <div className={styles.cornerb}></div>
          <div className={styles.scanLine}></div>
                </div>
            </div>

      <div className={styles.boxToe}>
        <div>将二维码放入框内，即可自动扫描</div>
            </div>

      <div className={styles.toolbar}>
        <div className={styles.toolItem}>
                <input
                    type="file"
            accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
            style={{ display: 'none' }}
                />
                <div
            className={styles.toolIcon}
            onClick={() => fileInputRef.current?.click()}
          >
            <NutImage className={styles.albumIcon} />
          </div>
          <p className={styles.toolText}>相册</p>
        </div>

        <div 
          className={styles.toolItem}
          onClick={toggleFlashlight}
        >
          <div className={styles.toolIcon}>
            <Eye className={styles.albumIcon} />
          </div>
          <p className={styles.toolText}>照明</p>
                </div>
            </div>

      {lastResult && (
        <div className={styles.result} onClick={handleResultClick}>
          <p>类型: {lastResult.type}</p>
          {lastResult.type === 'internal' && lastResult.data && (
            <>
              <p>隐患描述: {lastResult.data.detail}</p>
              <p>隐患地点: {lastResult.data.place}</p>
              <p>状态: {
                lastResult.data.state === '1' ? '未处理' : 
                lastResult.data.state === '2' ? '处理中' : 
                lastResult.data.state === '3' ? '已完成' : '未知状态'
              }</p>
              <p style={{ color: 'blue', textDecoration: 'underline' }}>点击查看详情</p>
            </>
          )}
          {lastResult.type === 'external' && (
            <p>外部链接: <a href={lastResult.content} target="_blank" rel="noopener noreferrer">{lastResult.content}</a></p>
          )}
          {lastResult.type === 'unknown' && (
            <p>未知内容: {lastResult.content}</p>
          )}
        </div>
      )}
        </div>
    );
};

export default Sweep;
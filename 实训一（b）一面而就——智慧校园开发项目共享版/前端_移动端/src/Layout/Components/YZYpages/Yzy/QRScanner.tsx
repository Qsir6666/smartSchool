import React, { useState, useEffect, useRef } from 'react';
import { NavBar, Dialog } from '@nutui/nutui-react';
import { ArrowLeft } from '@nutui/icons-react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../src/css/qrscanner.module.css';

interface QRCodeResult {
  type: 'internal' | 'external' | 'unknown';
  content: string;
  timestamp: number;
}

const QRScannerPage: React.FC = () => {
  const nav = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [lastResult, setLastResult] = useState<QRCodeResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 初始化摄像头
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        startScanning();
      } catch (error) {
        console.error('摄像头初始化失败:', error);
        Dialog.alert({
          title: '错误',
          content: '无法访问摄像头，请检查权限设置',
          onConfirm: () => nav(-1)
        });
      }
    };

    initCamera();

    return () => {
      stopScanning();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 判断二维码类型
  const determineQRType = (content: string): QRCodeResult['type'] => {
    // 内部二维码格式判断
    if (content.startsWith('YZY_')) {
      return 'internal';
    }
    // 外部二维码格式判断（可以根据需要添加更多判断条件）
    if (content.startsWith('http://') || content.startsWith('https://')) {
      return 'external';
    }
    return 'unknown';
  };

  // 处理扫描结果
  const handleScanResult = (result: string) => {
    const type = determineQRType(result);
    const qrResult: QRCodeResult = {
      type,
      content: result,
      timestamp: Date.now()
    };

    setLastResult(qrResult);
    stopScanning();

    // 根据二维码类型处理结果
    switch (type) {
      case 'internal':
        handleInternalQR(result);
        break;
      case 'external':
        handleExternalQR(result);
        break;
      default:
        handleUnknownQR(result);
    }
  };

  // 处理内部二维码
  const handleInternalQR = (content: string) => {
    // 提取内部二维码信息
    const [, id] = content.split('_');
    Dialog.alert({
      title: '扫描成功',
      content: '发现内部隐患二维码',
      onConfirm: () => {
        nav('/detail', { state: { id } });
      }
    });
  };

  // 处理外部二维码
  const handleExternalQR = (content: string) => {
    Dialog.alert({
      title: '扫描成功',
      content: '发现外部链接二维码',
      onConfirm: () => {
        window.open(content, '_blank');
        startScanning();
      }
    });
  };

  // 处理未知二维码
  const handleUnknownQR = (content: string) => {
    Dialog.alert({
      title: '扫描结果',
      content: `未知类型的二维码内容: ${content}`,
      onConfirm: () => {
        startScanning();
      }
    });
  };

  // 开始扫描
  const startScanning = () => {
    setScanning(true);
    scanQRCode();
  };

  // 停止扫描
  const stopScanning = () => {
    setScanning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // 扫描二维码
  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // 设置canvas尺寸与视频相同
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 绘制视频帧到canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 获取图像数据
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // 使用jsQR库解析二维码
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        handleScanResult(code.data);
      }
    } catch (error) {
      console.error('二维码解析错误:', error);
    }

    // 继续扫描
    animationFrameRef.current = requestAnimationFrame(scanQRCode);
  };

  return (
    <div className={QRScanner.container}>
      <NavBar
        back={<ArrowLeft />}
        onBackClick={() => nav(-1)}
      >
        二维码扫描
      </NavBar>

      <div className={QRScanner.scannerContainer}>
        <video
          ref={videoRef}
          className={QRScanner.video}
          autoPlay
          playsInline
        />
        <canvas
          ref={canvasRef}
          className={QRScanner.canvas}
          style={{ display: 'none' }}
        />
        <div className={QRScanner.overlay}>
          <div className={QRScanner.scanArea} />
        </div>
      </div>

      {lastResult && (
        <div className={QRScanner.result}>
          <p>类型: {lastResult.type}</p>
          <p>内容: {lastResult.content}</p>
          <p>时间: {new Date(lastResult.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default QRScannerPage; 
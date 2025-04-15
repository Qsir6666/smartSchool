import React,{ useRef, useState, useEffect } from 'react';
import '../hbc.css'
import { CameraOutline } from 'antd-mobile-icons';

interface CameraProps {
  onCapture: (imageData: string) => void;
}

export default function CameraAuth({ onCapture }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');

  // 初始化摄像头
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('需要摄像头访问权限');
      }
    };
    initCamera();
    
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
  
  // 捕获照片
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx?.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageData);
  };

  return (
    <div className="camera-auth">
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline muted />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button onClick={capturePhoto} className="capture-btn">
            <CameraOutline fontSize={24} />
          </button>
        </>
      )}
    </div>
  );
}

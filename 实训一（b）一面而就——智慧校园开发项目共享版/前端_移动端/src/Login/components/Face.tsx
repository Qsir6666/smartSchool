import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import styles from './Face.module.css';
import { Toast } from 'antd-mobile'
import { useNavigate } from 'react-router-dom';

// 定义 FaceDescriptor 类型
type FaceDescriptor = Float32Array;

export default function FaceRegistration() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [knownDescriptors, setKnownDescriptors] = useState<FaceDescriptor[]>([]);
  const [isLiveVerified, setIsLiveVerified] = useState<boolean>(false);
  const [headPoseHistory, setHeadPoseHistory] = useState<{ yaw: number; pitch: number; roll: number }[]>([]);
  const detectionInterval = useRef<any | null>(null);
  const colorInterval = useRef<any | null>(null);
  const back = ['#0000ff', '#ff0000', '#008000', '#800000', '#ffff00', '#1e386b'];
  const [colorse, setColorse] = useState<string>('#0000ff');
  const [isColor, setIscolor] = useState<boolean>(false);

  const ChangeBack = () => {
    let index = 0;
    colorInterval.current = setInterval(() => {
      setColorse(back[index]);
      index = index + 1;
      if (index >= back.length) {
        index = 0;
      }
      // console.log(index);
    }, 500);
  };

  useEffect(() => {
    if (isColor && colorInterval.current) {
      clearInterval(colorInterval.current);
    }
  }, [isColor]);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      setIsLoading(false)
      loadImagesAndExtractDescriptors()
    };
    loadModels()

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    }
  }, [])


  useEffect(() => {
    if (!isLoading) {
      startVideo();
      startHeadPoseDetection();
    }
  }, [isLoading]);

  const loadImagesAndExtractDescriptors = async () => {
    const imagePaths = [
      '/imgs/loginimgs/face1.jpg', 
      '/imgs/loginimgs/face2.jpg', 
      '/imgs/loginimgs/face.jpg',
      '/imgs/loginimgs/face3.jpg',
      '/imgs/loginimgs/face4.jpg',
    ]
    const descriptors: FaceDescriptor[] = [];

    for (const path of imagePaths) {
      const img = await faceapi.fetchImage(path);
      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length > 0) {
        descriptors.push(detections[0].descriptor);
      } else {
        console.log(`未从图片 ${path} 中检测到人脸`);
      }
    }

    setKnownDescriptors(descriptors);
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          console.log('摄像头已开启');
          ChangeBack();
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('无法访问摄像头:', err);
        setMessage('无法访问摄像头，请确保已授予权限。');
      });
  };

  const startHeadPoseDetection = () => {
    setMessage('拿起手机，左右摇头进行活体验证');

    detectionInterval.current = setInterval(async () => {
      if (!videoRef.current || isLiveVerified) return;

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detections.length > 0) {
          const landmarks = detections[0].landmarks;
          const nose = landmarks.getNose();
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();

          const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
          const noseX = nose[3].x;
          const yaw = noseX - eyeCenterX;

          setHeadPoseHistory(prev => {
            const newHistory = [...prev, { yaw, pitch: 0, roll: 0 }].slice(-10);

            if (newHistory.length >= 10) {
              const minYaw = Math.min(...newHistory.map(h => h.yaw));
              const maxYaw = Math.max(...newHistory.map(h => h.yaw));

              if (maxYaw - minYaw > 30) {
                setIsLiveVerified(true);
                setMessage('活体验证通过，请保持正对摄像头');
                if (detectionInterval.current) {
                  clearInterval(detectionInterval.current);
                }
              }
            }

            return newHistory;
          });
        }
      } catch (error) {
        console.error('检测失败:', error);
      }
    }, 200);
  };


  const recognizeFace = async () => {
    if (!isLiveVerified) {
      setMessage('拿起手机，左右摇头进行活体验证');
      return;
    }

    if (!videoRef.current || !canvasRef.current || knownDescriptors.length === 0) {
      setMessage('摄像头未启动或未加载图片特征');
      return;
    }
    // console.log(knownDescriptors,'看看');
    

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length > 0) {
      const currentDescriptor = detections[0].descriptor;
      const labeledDescriptors = knownDescriptors.map((descriptor, index) =>
        new faceapi.LabeledFaceDescriptors(`known_${index}`, [descriptor])
      );
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.46);
      const bestMatch = faceMatcher.findBestMatch(currentDescriptor);

      if (bestMatch.label !== 'unknown') {
        console.log(bestMatch,'识别成功：匹配到图片中的人脸');
        
        setMessage(`识别成功：匹配到图片中的人脸`);
        let userMsg = {}
        if(bestMatch.label=='known_0'){
          userMsg = { username: 'teacher1', password: '123456' }    //徐梓鑫
        }else if(bestMatch.label=='known_1'){
          userMsg = { username: 'baoan1', password: '111' }        //菜瑞勇
        }else if(bestMatch.label=='known_2'){
          userMsg = { username: '', password: '' }                 //杨志豪
        }else if(bestMatch.label=='known_3'){
          userMsg = { username: 'teacher2', password: '123456' }    //齐文纲
        }else if(bestMatch.label=='known_4'){
          userMsg = { username: 'baoan2', password: '133556' }    //贾晓虎
        }
        
        axios.post('http://localhost:3000/QWG/getLogin', userMsg).then(res => {
          if (res.data.code === 200) {
            Toast.show({
              icon: 'loading',
              content: '登录中…',
              afterClose: () => {
                localStorage.setItem('userMsg', JSON.stringify(res.data.data))
                localStorage.setItem('token', JSON.stringify(res.data.token))
                navigate('/layout')
                Toast.show({
                  content: `登录成功! 欢迎${res.data.data.jobposition == '保安' ? res.data.data.jobposition : ''}${res.data.data.name}`,
                })
              },
            })
          } else {
            Toast.show({
              icon: 'loading',
              content: '登录中…',
              afterClose: () => {
                Toast.show({
                  content:
                    <div style={{ textAlign: 'center' }}>
                      登录失败！
                      <br />
                      请检查用户名密码是否正确
                    </div>
                })
              },
            })
          }
            

            setIscolor(true)
          })
          .catch((error) => {
            console.error('登录请求失败:', error);
          });
      } else {
        setMessage('识别失败：未找到匹配的人脸');
      }
    } else {
      setMessage('未检测到人脸，请确保摄像头对准人脸');
    }
  };

  useEffect(() => {
    recognizeFace();
  }, [isLiveVerified]);

  return (
    <div>
      <div className={styles.back} style={{ backgroundColor: colorse }}>
        {message && <p style={{ fontWeight: 'bold', marginBottom: '50px' }}>{message}</p>}
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            width="210"
            height="210"
            autoPlay
            muted
            className={styles.video}
          />
        </div>
        <canvas ref={canvasRef} width="210" height="210" className={styles.canvas} />
      </div>
    </div>
  );
};


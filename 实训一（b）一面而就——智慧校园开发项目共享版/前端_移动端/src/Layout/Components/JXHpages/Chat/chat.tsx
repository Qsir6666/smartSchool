
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import style from './CSS/chat.module.css';
import { images } from '../Img/imgage'
import { useNavigate } from 'react-router-dom';
import 'animate.css';


async function chatMen(context: string, isRed: boolean) {
  try {
    var isred = ""
    if (isRed) {
      isred = "现在开始角色扮演 咱俩就是互喷的好基友 不管我说什么你都要怼我"
    } else {
      isred = "你是一款人工智能用来解决用户问题"
    }
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions',
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: isred },
          { role: "user", content: context }
        ],
        temperature: 0.1,// 0.7 表示模型更加保守，0.0则表示模型更加开放
        max_tokens: 100,
        top_p: 0.3, // 置信度，默认1.0
        stream: false, 
      },
      {
        headers: {
          'Authorization': `Bearer sk-6a2a019a94174c73a26d468d37963903`,
          'Content-Type': 'application/json'
        },
      }
    );
    console.log('回复了孩子:', response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  }
  catch (error: any) {
    console.error('失败了孩子:', error.response?.data || error.message);
  }
}




declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}


const ChatWindow: React.FC = () => {
  const navigate = useNavigate();
  const [isRed, setIsRed] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const [typingOutput, setTypingOutput] = useState(''); // 输出缓存
  const typingIndexRef = useRef(0); // 输出缓存索引
  const currentResponseRef = useRef(''); // 当前输出缓存

  const chatBoxRef = useRef<HTMLDivElement>(null); // 聊天框引用

  const [isRecording, setIsRecording] = useState(false); // 是否正在录音
  const recognitionRef = useRef<any>(null);// 语音识别实例   

  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;// 兼容不同浏览器
    const recognition = new SpeechRecognition(); // 创建语音识别实例
    recognition.continuous = true; // 持续识别
    recognition.interimResults = true; // 实时返回中间结果
    recognition.onstart = () => {
      console.log('开始监听'); // 开始监听
      setIsRecording(true); // 设置录音状态
    };
    recognition.onend = () => {
      console.log('停止监听'); // 停止监听
      setIsRecording(false); // 设置录音状态
    };
    recognition.onresult = (event: any) => {
      // setTranscript(event.results[0][0].transcript); // 设置识别结果
      setMessage(event.results[0][0].transcript); // 设置识别结果
    };
    return recognition; // 返回语音识别实例
  };

  const onclickUpDown = () => {
    if (isRecording) {
      console.log('关闭');
      recognitionRef.current?.stop();  // 停止现有识别
      recognitionRef.current = null; // 清空识别实例
    } else {
      console.log('打开了');
      const newRecognition = initRecognition();   // 创建新实例 
      if (!newRecognition) return; // 退出函数
      recognitionRef.current = newRecognition; // 设置识别实例
      console.log(recognitionRef.current);
      setMessage('');  // 重置文本
      // setTranscript('');  // 重置文本
      newRecognition.start(); // 开始识别
    }
  };



  // 逐字输出效果
  const startTypingEffect = (response: string) => {
    currentResponseRef.current = response; 
    typingIndexRef.current = -1; // 重置输出索引
    const typeNextCharacter = () => {
      if (typingIndexRef.current < currentResponseRef.current.length) { 
        setTypingOutput(prev =>
          prev + currentResponseRef.current.charAt(typingIndexRef.current) 
        );
        typingIndexRef.current += 1;
        setTimeout(typeNextCharacter, 40); // 控制输入速度
      }
    };
    typeNextCharacter();
  };



  // 滚动到底部
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };



  const sendMessage = async () => { // 发送消息
    setIsRecording(false); // 设置录音状态
    if (!message.trim()) return; // 空消息不发送
    const userMessage = `You: ${message}`;    // 用户消息立即显示
    setMessages(obj => [...obj, userMessage]);
    // try {
    setMessage(''); // 清空输入框
    setMessages(obj => [...obj, `AI: 思考中... `]);      // 添加等待中的AI消息
    const response = await chatMen(message, isRed);
    setMessages(obj => {
      const filtered = obj.filter(pro => pro !== `AI: 思考中... `);
      return [...filtered, `AI: `]; // 空消息模板
    });
    setTypingOutput(''); // 重置输出缓存
    startTypingEffect(response);
    // } catch (error) {
    //   setMessages(obj => [
    //     ...obj.filter(pro => pro !== `AI: 思考中... `),
    //     `AI: 服务响应失败`
    //   ]);
    // }
  };



  // 监听输出变化
  useEffect(() => {
    if (typingOutput) {
      setMessages(obj => {
        const lastIndex = obj.length - 1;
        const lastMessage = obj[lastIndex];
        if (lastMessage.startsWith('AI: ')) {
          const newMessages = [...obj];
          newMessages[lastIndex] = `AI: ${typingOutput}`;
          return newMessages;
        }
        return obj;
      });
    }
  }, [typingOutput]);




  // 监听消息变化 然后自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onIsRed = () => {
    setIsRed(obj => !obj);
  };


  return (
    <div className="animate__animated animate__fadeInRight">
      <div className={style.boxs}>
        <div className={style.header}>
          <div onClick={() => navigate('/layout/mine')}>⟨</div>
          <div>
            {
              isRed ? 'Amazing' : 'AI Chat'
            }
          </div>
          <div onClick={onIsRed}>
            {
              isRed ?
                <div>{images.chatamazing}</div> :
                <div>{images.chatAichat}</div>
            }


          </div>
        </div>
        <div ref={chatBoxRef} className={style.chatbox}>
          {messages.map((item, index) => (
            <div key={`${index}-${item}`} className={item.startsWith('You: ') ? style.yous : style.AIs}>
              <div>
                {item.startsWith('You: ') ?
                  <div className={style.imgmen}>
                    {images.chatkun}
                  </div>
                  :
                  <div className={style.imgmenok}>
                    {images.chatlanqiu}
                  </div>
                }
              </div>
              <div className={item.startsWith('You: ') ? style.you : style.AI}>
                {item.split(': ')[1]}

              </div>
            </div>
          ))}
        </div>

        <div className={style.buttons}>
          <div className={style.change} onClick={onclickUpDown}>
            {isRecording ?
              <div>{images.chatMicOne} </div> :
              <div>{images.chatMicTwo} </div>
            }
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="  Type your message"
          />
          <button onClick={sendMessage}>
            {images.chatPlane}
          </button>
        </div>
      </div>
    </div>

  );
};

export default ChatWindow;

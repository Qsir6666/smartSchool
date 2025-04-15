// AIChatComponent.jsx
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import axios from 'axios';

const AIChatComponent = forwardRef(({ 
  onResponse,
  apiKey,
  apiUrl = 'https://api.deepseek.com/v1/chat/completions'
}, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAIResponse = async (question) => {
    if (!question?.trim()) return;

    setIsLoading(true);
    setError(null);
    const controller = new AbortController();

    try {
      const response = await axios.post(apiUrl, {
        messages: [{ role: "user", content: question }],
        model: "deepseek-chat",
        temperature: 0.7,
        max_tokens: 500
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        signal: controller.signal,
        timeout: 30000
      });

      const aiResponse = response.data?.choices?.[0]?.message?.content;
      aiResponse 
        ? onResponse(aiResponse)
        : onResponse(null, '响应结构异常');
    } catch (err) {
      if (!axios.isCancel(err)) {
        const message = err.response?.data?.error?.message || err.message;
        onResponse(null, message);
      }
    } finally {
      setIsLoading(false);
      controller.abort();
    }
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    triggerRequest: fetchAIResponse
  }));

  return (
    <div className="ai-status">
      {/* {isLoading && <div className="loading">🚀 AI正在思考中...</div>}
      {error && <div className="error">❌ {error}</div>} */}
    </div>
  );
});

export default AIChatComponent;

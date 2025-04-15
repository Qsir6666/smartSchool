// AIChatComponent.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIChatComponent = ({ onResponse }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const processMessage = async (message) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3000/ai/chat', {
        message: message
      });

      if (response.data && response.data.reply) {
        onResponse(response.data.reply);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('AI服务暂时无法响应，请稍后再试');
      onResponse('抱歉，我现在无法正常回答，请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  return null;
};

export default AIChatComponent;

'use client';

import { useState } from 'react';
import { useActions, useUIState } from 'ai/rsc';
import { AI } from '../ai';
import { ToolConfirmation } from './ToolConfirmation';
import { WeatherResult } from './WeatherResult';

interface WeatherConfirmationProps {
  location: string;
}

export function WeatherConfirmation({ location }: WeatherConfirmationProps) {
  const { continueConversation } = useActions();
  const [conversation, setConversation] = useUIState<typeof AI>();

  // 模拟天气 API（复制自 actions.tsx）
  const getWeather = async (location: string) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return Math.round(Math.random() * (90 - 32) + 32);
  };

  const handleConfirm = async () => {
    try {
      // 执行天气查询
      const temperature = await getWeather(location);
      
      // 替换当前确认组件为结果组件
      setConversation((currentConversation) => {
        const newConversation = [...currentConversation];
        const lastIndex = newConversation.length - 1;
        
        if (lastIndex >= 0) {
          newConversation[lastIndex] = {
            ...newConversation[lastIndex],
            display: (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  🤖 AI 助手
                </div>
                <WeatherResult location={location} temperature={temperature} />
              </div>
            ),
          };
        }
        
        return newConversation;
      });
    } catch (error) {
      console.error('Weather lookup failed:', error);
      setConversation((currentConversation) => {
        const newConversation = [...currentConversation];
        const lastIndex = newConversation.length - 1;
        
        if (lastIndex >= 0) {
          newConversation[lastIndex] = {
            ...newConversation[lastIndex],
            display: (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  🤖 AI 助手
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="text-red-700 dark:text-red-300">
                    获取天气信息失败，请稍后重试。
                  </div>
                </div>
              </div>
            ),
          };
        }
        
        return newConversation;
      });
    }
  };

  const handleCancel = () => {
    // 替换当前确认组件为取消消息
    setConversation((currentConversation) => {
      const newConversation = [...currentConversation];
      const lastIndex = newConversation.length - 1;
      
      if (lastIndex >= 0) {
        newConversation[lastIndex] = {
          ...newConversation[lastIndex],
          display: (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
              <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                🤖 AI 助手
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-gray-600 dark:text-gray-300">
                  ❌ 已取消天气查询。有什么其他我可以帮助您的吗？
                </div>
              </div>
            </div>
          ),
        };
      }
      
      return newConversation;
    });
  };

  return (
    <ToolConfirmation
      toolName="weather"
      description="获取天气信息"
      parameters={{ location }}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}

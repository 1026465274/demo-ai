'use client';

import { useState } from 'react';
import { useActions, useUIState } from 'ai/rsc';
import { AI } from '../ai';
import { ToolConfirmation } from './ToolConfirmation';

interface TemperatureConfirmationProps {
  temperature: number;
  location: string;
}

export function TemperatureConfirmation({ temperature, location }: TemperatureConfirmationProps) {
  const { continueConversation } = useActions();
  const [conversation, setConversation] = useUIState<typeof AI>();

  // 温度转换函数（复制自 actions.tsx）
  const convertFahrenheitToCelsius = async (temperature: number) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Math.round((temperature - 32) * (5 / 9));
  };

  // 温度转换结果组件
  const TemperatureResultComponent = ({ 
    originalTemp, 
    convertedTemp, 
    location 
  }: { 
    originalTemp: number; 
    convertedTemp: number;
    location: string;
  }) => (
    <div className="border border-green-200 dark:border-green-700 p-4 rounded-lg max-w-fit bg-green-50 dark:bg-green-900/20">
      <div className="mb-3">
        <h3 className="font-semibold text-lg">✅ 温度转换完成</h3>
        <p className="text-gray-600 dark:text-gray-300">{location} 的温度：</p>
        <div className="mt-2 space-y-1">
          <p>
            华氏度:{" "}
            <span className="font-bold text-orange-600">{originalTemp}°F</span>
          </p>
          <p>
            摄氏度:{" "}
            <span className="font-bold text-green-600">{convertedTemp}°C</span>
          </p>
        </div>
      </div>
      <div className="text-sm text-green-700 dark:text-green-300 font-medium">
        🎉 任务完成！
      </div>
    </div>
  );

  const handleConfirm = async () => {
    try {
      // 执行温度转换
      const celsius = await convertFahrenheitToCelsius(temperature);
      
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
                <TemperatureResultComponent
                  originalTemp={temperature}
                  convertedTemp={celsius}
                  location={location}
                />
              </div>
            ),
          };
        }
        
        return newConversation;
      });
    } catch (error) {
      console.error('Temperature conversion failed:', error);
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
                    温度转换失败，请稍后重试。
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
                  ❌ 已取消温度转换。有什么其他我可以帮助您的吗？
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
      toolName="convertFahrenheitToCelsius"
      description="温度转换"
      parameters={{ temperature: `${temperature}°F`, location }}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
